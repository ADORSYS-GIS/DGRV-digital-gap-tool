use crate::{
    entities::{
        assessments::{self, AssessmentStatus, Entity as Assessment},
        reports::{
            ActiveModel as NewReport, Model as ReportModel, ReportFormat, ReportStatus, ReportType,
        },
    },
    error::AppError,
    services::report_service::ReportService,
};
use sea_orm::{ActiveModelTrait, DbConn, EntityTrait, Set};
use std::sync::Arc;
use uuid::Uuid;

#[derive(Clone)]
pub struct SubmissionService {
    db: Arc<DbConn>,
    report_service: Arc<ReportService>,
}

impl SubmissionService {
    pub fn new(db: Arc<DbConn>, report_service: Arc<ReportService>) -> Self {
        Self { db, report_service }
    }

    pub async fn submit_assessment(
        &self,
        assessment_id: Uuid,
        user_id: String,
    ) -> Result<ReportModel, AppError> {
        let _user_uuid = Uuid::parse_str(&user_id)
            .map_err(|_| AppError::BadRequest("Invalid user ID format".to_string()))?;

        let mut assessment: assessments::ActiveModel = Assessment::find_by_id(assessment_id)
            .one(self.db.as_ref())
            .await?
            .ok_or_else(|| AppError::NotFound("Assessment not found".to_string()))?
            .into();

        assessment.status = Set(AssessmentStatus::Completed);
        assessment.updated_at = Set(chrono::Utc::now());
        assessment.update(self.db.as_ref()).await?;

        let report_id = Uuid::new_v4();
        let new_report = NewReport {
            report_id: Set(report_id),
            assessment_id: Set(assessment_id),
            status: Set(ReportStatus::Pending),
            report_type: Set(ReportType::Summary),
            title: Set("Summary Report".to_string()),
            format: Set(ReportFormat::Pdf),
            ..Default::default()
        };

        let report_model = new_report.insert(self.db.as_ref()).await?;

        let report_service = self.report_service.clone();
        tokio::spawn(async move {
            if let Err(e) = report_service
                .generate_report_for_submission(report_id)
                .await
            {
                eprintln!(
                    "Failed to generate report for assessment {}: {}",
                    assessment_id, e
                );
            }
        });

        Ok(report_model)
    }
}
