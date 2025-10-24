use async_trait::async_trait;
use bytes::Bytes;
use uuid::Uuid;
use crate::entities::reports::{ReportFormat, ReportStatus, ReportType};
use crate::error::AppError;
use crate::repositories::reports::ReportsRepository;
use crate::services::s3_storage::{FileStorageService, S3StorageService};
use sea_orm::DatabaseConnection;

pub struct ReportService {
    storage_service: S3StorageService,
    db: DatabaseConnection,
}

impl ReportService {
    pub async fn new(config: &crate::config::MinioConfig, db: DatabaseConnection) -> Result<Self, AppError> {
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
        let object_name = self.storage_service.generate_object_name(&report_id, &format.to_string());
        
        let content_type = match format {
            ReportFormat::Pdf => "application/pdf",
            ReportFormat::Excel => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ReportFormat::Json => "application/json",
        };

        // Upload file to S3/MinIO
        let _ = self.storage_service
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

        ReportsRepository::create(&self.db, report).await
    }

    pub async fn get_report_file(
        &self,
        report_id: Uuid,
    ) -> Result<(crate::entities::reports::Model, Bytes), AppError> {
        // Get report metadata
        let report = ReportsRepository::find_by_id(&self.db, report_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Report not found".to_string()))?;

        // Expect object key in file_path
        let object_name = report.file_path.as_ref()
            .ok_or_else(|| AppError::NotFound("Report file not available".to_string()))?;

        // Download file from S3/MinIO
        let file_data = self.storage_service
            .download_file(object_name)
            .await?;

        Ok((report, file_data))
    }

    pub async fn delete_report(
        &self,
        report_id: Uuid,
    ) -> Result<bool, AppError> {
        // Get report metadata
        let report = ReportsRepository::find_by_id(&self.db, report_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Report not found".to_string()))?;

        // Delete file from S3/MinIO if it exists
        if let Some(object_name) = &report.file_path {
            self.storage_service
                .delete_file(object_name)
                .await?;
        }

        // Delete report from database
        ReportsRepository::delete(&self.db, report_id).await
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
        self.storage_service.upload_file(object_name, data, content_type).await
    }

    async fn download_file(&self, object_name: &str) -> Result<Bytes, AppError> {
        self.storage_service.download_file(object_name).await
    }

    async fn delete_file(&self, object_name: &str) -> Result<(), AppError> {
        self.storage_service.delete_file(object_name).await
    }
}