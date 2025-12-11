use crate::entities::reports::{ReportFormat, ReportStatus, ReportType};
use crate::error::AppError;
use crate::repositories::reports::ReportsRepository;
use crate::services::pdf_generator::PdfGeneratorService;
use crate::services::s3_storage::{FileStorageService, S3StorageService};
use async_trait::async_trait;
use bytes::Bytes;
use sea_orm::DatabaseConnection;
use tracing::{error, info, instrument};
use uuid::Uuid;

use std::sync::Arc;

pub struct ReportService {
    storage_service: S3StorageService,
    db: Arc<DatabaseConnection>,
}

impl ReportService {
    pub async fn new(
        config: &crate::config::MinioConfig,
        db: Arc<DatabaseConnection>,
    ) -> Result<Self, AppError> {
        let storage_service = S3StorageService::new(config).await?;
        Ok(Self {
            storage_service,
            db,
        })
    }

    pub async fn generate_and_store_report(
        &self,
        assessment_id: Uuid,
        report_type: ReportType,
        title: String,
        format: ReportFormat,
        report_data: Bytes,
    ) -> Result<crate::entities::reports::Model, AppError> {
        // Create report record in database
        let report_id = Uuid::new_v4();
        let object_name = self
            .storage_service
            .generate_object_name(&report_id, &format.to_string());

        let content_type = match format {
            ReportFormat::Pdf => "application/pdf",
            ReportFormat::Excel => {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
            ReportFormat::Json => "application/json",
        };

        // Upload file to S3/MinIO
        let _ = self
            .storage_service
            .upload_file(&object_name, report_data, content_type)
            .await?;

        // Create report entity
        let report = crate::entities::reports::ActiveModel {
            report_id: sea_orm::ActiveValue::Set(report_id),
            assessment_id: sea_orm::ActiveValue::Set(assessment_id),
            report_type: sea_orm::ActiveValue::Set(report_type),
            title: sea_orm::ActiveValue::Set(title),
            format: sea_orm::ActiveValue::Set(format),
            summary: sea_orm::ActiveValue::Set(None),
            report_data: sea_orm::ActiveValue::Set(None), // Store in object storage instead
            file_path: sea_orm::ActiveValue::Set(Some(object_name)),
            status: sea_orm::ActiveValue::Set(ReportStatus::Completed),
            generated_at: sea_orm::ActiveValue::Set(chrono::Utc::now()),
            created_at: sea_orm::ActiveValue::Set(chrono::Utc::now()),
            updated_at: sea_orm::ActiveValue::Set(chrono::Utc::now()),
        };

        ReportsRepository::create(self.db.as_ref(), report).await
    }

    pub async fn get_report_file(
        &self,
        report_id: Uuid,
    ) -> Result<(crate::entities::reports::Model, Bytes), AppError> {
        tracing::info!(report_id = %report_id, "Attempting to get report file");
        let report = match ReportsRepository::find_by_id(self.db.as_ref(), report_id).await {
            Ok(Some(r)) => {
                tracing::info!(report_id = %report_id, "Found report metadata in database");
                r
            }
            Ok(None) => {
                tracing::warn!(report_id = %report_id, "Report metadata not found in database");
                return Err(AppError::NotFound("Report not found".to_string()));
            }
            Err(e) => {
                tracing::error!(error = %e, "Database error while fetching report metadata");
                return Err(e);
            }
        };

        let object_name = report
            .file_path
            .as_ref()
            .ok_or_else(|| AppError::NotFound("Report file not available".to_string()))?;

        tracing::info!(object_name = %object_name, "Downloading file from S3");
        let file_data = self.storage_service.download_file(object_name).await?;

        Ok((report, file_data))
    }

    pub async fn delete_report(&self, report_id: Uuid) -> Result<bool, AppError> {
        // Get report metadata
        let report = ReportsRepository::find_by_id(self.db.as_ref(), report_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Report not found".to_string()))?;

        // Delete file from S3/MinIO if it exists
        if let Some(object_name) = &report.file_path {
            self.storage_service.delete_file(object_name).await?;
        }

        // Delete report from database
        ReportsRepository::delete(self.db.as_ref(), report_id).await
    }
    #[instrument(skip(self), fields(report_id = %report_id))]
    pub async fn generate_report_for_submission(&self, report_id: Uuid) -> Result<(), AppError> {
        info!("Starting report generation for submission.");

        // 1. Fetch the report to get the assessment_id
        let report = match ReportsRepository::find_by_id(self.db.as_ref(), report_id).await {
            Ok(Some(r)) => r,
            Ok(None) => {
                error!("Report not found in database.");
                return Err(AppError::NotFound("Report not found".to_string()));
            }
            Err(e) => {
                error!(error = %e, "Database error while fetching report.");
                return Err(e);
            }
        };

        // Wrap the generation logic in a block to handle errors and update status
        let generation_result = async {
            // 2. Generate the PDF using the PdfGeneratorService
            info!(assessment_id = %report.assessment_id, "Generating PDF for assessment.");
            let pdf_bytes = PdfGeneratorService::generate_assessment_pdf(
                self.db.as_ref(),
                report.assessment_id,
            )
            .await?;

            // 3. Store the report file in S3/MinIO
            info!("Uploading generated PDF to storage.");
            let object_name = self
                .storage_service
                .generate_object_name(&report.report_id, &ReportFormat::Pdf.to_string());
            self.storage_service
                .upload_file(&object_name, pdf_bytes, "application/pdf")
                .await?;
            info!(object_name = %object_name, "PDF uploaded successfully.");

            // 4. Update the report status to 'Completed'
            info!("Updating report status to 'Completed'.");
            let mut updated_report: crate::entities::reports::ActiveModel = report.into();
            updated_report.status = sea_orm::ActiveValue::Set(ReportStatus::Completed);
            updated_report.file_path = sea_orm::ActiveValue::Set(Some(object_name));
            updated_report.generated_at = sea_orm::ActiveValue::Set(chrono::Utc::now());
            updated_report.updated_at = sea_orm::ActiveValue::Set(chrono::Utc::now());
            ReportsRepository::update(
                self.db.as_ref(),
                updated_report.report_id.clone().unwrap(),
                updated_report,
            )
            .await?;
            info!("Report status updated to 'Completed'.");

            Ok(())
        }
        .await;

        if let Err(e) = generation_result {
            error!(error = %e, "Report generation failed. Updating status to 'Failed'.");
            let report_to_fail = ReportsRepository::find_by_id(self.db.as_ref(), report_id)
                .await?
                .ok_or_else(|| {
                    AppError::NotFound("Report disappeared during failure handling".to_string())
                })?;

            let mut updated_report: crate::entities::reports::ActiveModel = report_to_fail.into();
            updated_report.status = sea_orm::ActiveValue::Set(ReportStatus::Failed);
            updated_report.updated_at = sea_orm::ActiveValue::Set(chrono::Utc::now());
            ReportsRepository::update(
                self.db.as_ref(),
                updated_report.report_id.clone().unwrap(),
                updated_report,
            )
            .await?;
            return Err(e);
        }

        info!("Report generation process completed successfully.");
        Ok(())
    }
}

#[async_trait]
impl FileStorageService for ReportService {
    async fn upload_file(
        &self,
        object_name: &str,
        data: Bytes,
        content_type: &str,
    ) -> Result<String, AppError> {
        self.storage_service
            .upload_file(object_name, data, content_type)
            .await
    }

    async fn download_file(&self, object_name: &str) -> Result<Bytes, AppError> {
        self.storage_service.download_file(object_name).await
    }

    async fn delete_file(&self, object_name: &str) -> Result<(), AppError> {
        self.storage_service.delete_file(object_name).await
    }
}
