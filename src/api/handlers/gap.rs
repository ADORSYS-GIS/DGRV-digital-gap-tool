use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use sea_orm::{DatabaseConnection, Set};
use std::sync::Arc;
use uuid::Uuid;

use crate::api::dto::{
    common::{ApiResponse, PaginatedResponse, PaginationParams},
    gap::{
        CreateGapRequest, GapResponse, GapSeverity, SetGapDescriptionRequest,
        SetSeverityRulesRequest,
    },
};
use crate::api::handlers::common::{
    extract_pagination, success_response, success_response_with_message,
};
use crate::entities::gaps;
use crate::error::AppError;
use crate::repositories::dimension_assessments::DimensionAssessmentsRepository;
use crate::repositories::gaps::GapsRepository;

fn to_gap_response(model: gaps::Model) -> GapResponse {
    GapResponse {
        gap_id: model.gap_id,
        dimension_assessment_id: model.dimension_assessment_id,
        dimension_id: model.dimension_id,
        gap_size: model.gap_size,
        gap_severity: GapSeverity::from(model.gap_severity),
        gap_description: model.gap_description,
        calculated_at: model.calculated_at,
        created_at: model.created_at,
        updated_at: model.updated_at,
    }
}
/// Admin: set severity rules (placeholder, DB-backed logic TBD)
#[utoipa::path(
    post,
    path = "/admin/gap-severity-rules",
    request_body = SetSeverityRulesRequest,
    responses(
        (status = 200, description = "Severity rules set", body = inline(ApiResponse<()>))
    )
)]
pub async fn set_severity_rules(
    Json(_req): Json<SetSeverityRulesRequest>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
    Ok(success_response(()))
}

/// Admin: set gap description (placeholder, DB-backed logic TBD)
#[utoipa::path(
    post,
    path = "/admin/gap-descriptions",
    request_body = SetGapDescriptionRequest,
    responses(
        (status = 200, description = "Gap description set", body = inline(ApiResponse<()>))
    )
)]
pub async fn set_gap_description(
    Json(_req): Json<SetGapDescriptionRequest>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
    Ok(success_response(()))
}
#[utoipa::path(
    post,
    path = "/gaps",
    request_body = CreateGapRequest,
    responses(
        (status = 200, description = "Gap created", body = inline(ApiResponse<GapResponse>))
    )
)]
pub async fn create_gap(
    State(db): State<Arc<DatabaseConnection>>,
    Json(request): Json<CreateGapRequest>,
) -> Result<Json<ApiResponse<GapResponse>>, (StatusCode, Json<serde_json::Value>)> {
    // Look up the dimension assessment to derive gap values
    let da =
        DimensionAssessmentsRepository::find_by_id(db.as_ref(), request.dimension_assessment_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?
            .ok_or_else(|| {
                crate::api::handlers::common::handle_error(AppError::NotFound(
                    "Dimension assessment not found".to_string(),
                ))
            })?;

    let gap_size = request.gap_size;
    let severity = match gap_size.abs() {
        0..=1 => crate::entities::gaps::GapSeverity::Low,
        2..=3 => crate::entities::gaps::GapSeverity::Medium,
        _ => crate::entities::gaps::GapSeverity::High,
    };

    let active = gaps::ActiveModel {
        gap_id: Set(Uuid::new_v4()),
        dimension_assessment_id: Set(request.dimension_assessment_id),
        dimension_id: Set(da.dimension_id),
        gap_size: Set(gap_size),
        gap_severity: Set(severity),
        gap_description: Set(Some(request.gap_description)),
        calculated_at: Set(chrono::Utc::now()),
        ..Default::default()
    };

    let created = GapsRepository::create(db.as_ref(), active)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    Ok(success_response_with_message(
        to_gap_response(created),
        "Gap created successfully".to_string(),
    ))
}

#[utoipa::path(
    get,
    path = "/gaps/{id}",
    params(("id" = Uuid, Path, description = "Gap ID")),
    responses(
        (status = 200, description = "Gap fetched", body = inline(ApiResponse<GapResponse>)),
        (status = 404, description = "Gap not found")
    )
)]
pub async fn get_gap(
    State(db): State<Arc<DatabaseConnection>>,
    Path(gap_id): Path<Uuid>,
) -> Result<Json<ApiResponse<GapResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let gap = GapsRepository::find_by_id(db.as_ref(), gap_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Gap not found".to_string(),
            ))
        })?;

    Ok(success_response(to_gap_response(gap)))
}

#[utoipa::path(
    get,
    path = "/gaps",
    params(
        ("page" = Option<u32>, Query, description = "Page number (default 1)"),
        ("limit" = Option<u32>, Query, description = "Page size (default 20)")
    ),
    responses(
        (status = 200, description = "Gaps list", body = inline(ApiResponse<PaginatedResponse<GapResponse>>))
    )
)]
pub async fn list_gaps(
    State(db): State<Arc<DatabaseConnection>>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<PaginatedResponse<GapResponse>>>, (StatusCode, Json<serde_json::Value>)>
{
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    let offset = ((page - 1) * limit) as u64;

    let gaps = GapsRepository::find_all(db.as_ref())
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let total = gaps.len() as u64;
    let items: Vec<GapResponse> = gaps
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .map(to_gap_response)
        .collect();

    Ok(success_response(PaginatedResponse::new(
        items, total, page, limit,
    )))
}

#[utoipa::path(
    get,
    path = "/dimension-assessments/{dimension_assessment_id}/gaps",
    params(("dimension_assessment_id" = Uuid, Path, description = "Dimension assessment ID")),
    responses(
        (status = 200, description = "Gaps by dimension assessment", body = inline(ApiResponse<PaginatedResponse<GapResponse>>))
    )
)]
pub async fn list_gaps_by_dimension_assessment(
    State(db): State<Arc<DatabaseConnection>>,
    Path(dimension_assessment_id): Path<Uuid>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<PaginatedResponse<GapResponse>>>, (StatusCode, Json<serde_json::Value>)>
{
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    let offset = ((page - 1) * limit) as u64;

    let gaps = GapsRepository::find_by_dimension_assessment(db.as_ref(), dimension_assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let total = gaps.len() as u64;
    let items: Vec<GapResponse> = gaps
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .map(to_gap_response)
        .collect();

    Ok(success_response(PaginatedResponse::new(
        items, total, page, limit,
    )))
}

#[utoipa::path(
    get,
    path = "/assessments/{assessment_id}/gaps",
    params(("assessment_id" = Uuid, Path, description = "Assessment ID")),
    responses(
        (status = 200, description = "Gaps by assessment", body = inline(ApiResponse<PaginatedResponse<GapResponse>>))
    )
)]
pub async fn list_gaps_by_assessment(
    State(db): State<Arc<DatabaseConnection>>,
    Path(assessment_id): Path<Uuid>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<PaginatedResponse<GapResponse>>>, (StatusCode, Json<serde_json::Value>)>
{
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    let offset = ((page - 1) * limit) as u64;

    let gaps = GapsRepository::find_by_assessment(db.as_ref(), assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let total = gaps.len() as u64;
    let items: Vec<GapResponse> = gaps
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .map(to_gap_response)
        .collect();

    Ok(success_response(PaginatedResponse::new(
        items, total, page, limit,
    )))
}
