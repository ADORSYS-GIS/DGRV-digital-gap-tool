use crate::error::AppError;
use crate::{api::dto::report::ReportResponse, entities::reports::Model as ReportModel};
use crate::{auth::claims::Claims, services::submission_service::SubmissionService};
use axum::{extract::State, Json};
use serde::Deserialize;
use std::sync::Arc;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Deserialize, ToSchema)]
pub struct SubmitAssessmentRequest {
    pub assessment_id: Uuid,
}

/// Submit an assessment
///
/// This endpoint submits an assessment and triggers the generation of a report.
#[utoipa::path(
    post,
    path = "/api/submissions/submit",
    request_body = SubmitAssessmentRequest,
    responses(
        (status = 200, description = "Assessment submitted successfully", body = ReportResponse),
        (status = 400, description = "Bad request"),
        (status = 404, description = "Assessment not found"),
        (status = 500, description = "Internal server error")
    ),
    tag = "Submissions"
)]
#[axum::debug_handler]
pub async fn submit_assessment(
    State(state): State<crate::AppState>,
    claims: Claims,
    Json(body): Json<SubmitAssessmentRequest>,
) -> Result<Json<ReportResponse>, AppError> {
    let submission_service = SubmissionService::new(state.db.clone(), state.report_service.clone());
    let report = submission_service
        .submit_assessment(body.assessment_id, claims.subject)
        .await?;
    Ok(Json(report.into()))
}

impl From<ReportModel> for ReportResponse {
    fn from(model: ReportModel) -> Self {
        Self {
            report_id: model.report_id,
            assessment_id: model.assessment_id,
            report_type: model.report_type.into(),
            title: model.title,
            format: model.format,
            summary: model.summary,
            report_data: model.report_data,
            file_path: model.file_path,
            status: model.status.into(),
            generated_at: model.generated_at,
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}

impl From<crate::entities::reports::ReportType> for crate::api::dto::report::ReportType {
    fn from(rt: crate::entities::reports::ReportType) -> Self {
        match rt {
            crate::entities::reports::ReportType::Summary => {
                crate::api::dto::report::ReportType::Summary
            }
            crate::entities::reports::ReportType::Detailed => {
                crate::api::dto::report::ReportType::Detailed
            }
            crate::entities::reports::ReportType::ActionPlan => {
                crate::api::dto::report::ReportType::ActionPlan
            }
        }
    }
}

impl From<crate::entities::reports::ReportStatus> for crate::api::dto::report::ReportStatus {
    fn from(rs: crate::entities::reports::ReportStatus) -> Self {
        match rs {
            crate::entities::reports::ReportStatus::Pending => {
                crate::api::dto::report::ReportStatus::Pending
            }
            crate::entities::reports::ReportStatus::Generating => {
                crate::api::dto::report::ReportStatus::Generating
            }
            crate::entities::reports::ReportStatus::Completed => {
                crate::api::dto::report::ReportStatus::Completed
            }
            crate::entities::reports::ReportStatus::Failed => {
                crate::api::dto::report::ReportStatus::Failed
            }
        }
    }
}
