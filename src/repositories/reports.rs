use crate::entities::reports::{self, Entity as Reports};
use crate::error::AppError;
use sea_orm::sea_query::{Alias, Expr};
use sea_orm::*;
use uuid::Uuid;

pub struct ReportsRepository;

impl ReportsRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<reports::Model>, AppError> {
        Reports::find().all(db).await.map_err(AppError::from)
    }

    pub async fn find_by_id(
        db: &DbConn,
        report_id: Uuid,
    ) -> Result<Option<reports::Model>, AppError> {
        Reports::find_by_id(report_id)
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn create(
        db: &DbConn,
        report_data: reports::ActiveModel,
    ) -> Result<reports::Model, AppError> {
        let report_id = report_data.report_id.as_ref().clone();
        tracing::debug!(report_id = %report_id, "Creating new report in database");
        report_data.insert(db).await.map_err(|e| {
            tracing::error!(error = %e, "Database error creating report");
            AppError::from(e)
        })
    }

    pub async fn update(
        db: &DbConn,
        report_id: Uuid,
        report_data: reports::ActiveModel,
    ) -> Result<reports::Model, AppError> {
        let report = Reports::find_by_id(report_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Report not found".to_string()))?;

        let mut active_model: reports::ActiveModel = report.into();

        if let ActiveValue::Set(assessment_id) = report_data.assessment_id {
            active_model.assessment_id = Set(assessment_id);
        }
        if let ActiveValue::Set(report_type) = report_data.report_type {
            active_model.report_type = Set(report_type);
        }
        if let ActiveValue::Set(title) = report_data.title {
            active_model.title = Set(title);
        }
        if let ActiveValue::Set(format) = report_data.format {
            active_model.format = Set(format);
        }
        if let ActiveValue::Set(summary) = report_data.summary {
            active_model.summary = Set(summary);
        }
        if let ActiveValue::Set(report_data_json) = report_data.report_data {
            active_model.report_data = Set(report_data_json);
        }
        if let ActiveValue::Set(file_path) = report_data.file_path {
            active_model.file_path = Set(file_path);
        }
        if let ActiveValue::Set(status) = report_data.status {
            active_model.status = Set(status);
        }
        if let ActiveValue::Set(generated_at) = report_data.generated_at {
            active_model.generated_at = Set(generated_at);
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }

    pub async fn delete(db: &DbConn, report_id: Uuid) -> Result<bool, AppError> {
        let result = Reports::delete_by_id(report_id)
            .exec(db)
            .await
            .map_err(AppError::from)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn find_by_assessment(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<Vec<reports::Model>, AppError> {
        Reports::find()
            .filter(reports::Column::AssessmentId.eq(assessment_id))
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_latest_pdf_by_assessment(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<Option<reports::Model>, AppError> {
        // We cast columns to text to handle both Enum and Varchar types safely.
        // This resolves "operator does not exist" errors caused by schema inconsistencies.
        Reports::find()
            .filter(reports::Column::AssessmentId.eq(assessment_id))
            .filter(
                Expr::col(reports::Column::Format)
                    .cast_as(Alias::new("text"))
                    .eq("pdf"),
            )
            .filter(
                Expr::col(reports::Column::Status)
                    .cast_as(Alias::new("text"))
                    .eq("completed"),
            )
            .order_by_desc(reports::Column::GeneratedAt)
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_by_type(
        db: &DbConn,
        report_type: &str,
    ) -> Result<Vec<reports::Model>, AppError> {
        Reports::find()
            .filter(reports::Column::ReportType.eq(report_type))
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_by_status(
        db: &DbConn,
        status: &str,
    ) -> Result<Vec<reports::Model>, AppError> {
        Reports::find()
            .filter(reports::Column::Status.eq(status))
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn update_status(
        db: &DbConn,
        report_id: Uuid,
        status: crate::entities::reports::ReportStatus,
    ) -> Result<reports::Model, AppError> {
        let report = Reports::find_by_id(report_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Report not found".to_string()))?;

        let mut active_model: reports::ActiveModel = report.into();
        active_model.status = Set(status);
        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }

    pub async fn update_file_path(
        db: &DbConn,
        report_id: Uuid,
        file_path: &str,
    ) -> Result<reports::Model, AppError> {
        let report = Reports::find_by_id(report_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Report not found".to_string()))?;

        let mut active_model: reports::ActiveModel = report.into();
        active_model.file_path = Set(Some(file_path.to_string()));
        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }
}
