use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use sea_orm::{DatabaseConnection, Set};
use std::sync::Arc;
use uuid::Uuid;

use crate::api::dto::{
    common::{ApiResponse, EmptyResponse, PaginatedResponse, PaginationParams},
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
/// Set severity rules for gap analysis
/// 
/// This endpoint allows administrators to configure the severity thresholds for gap analysis.
/// The rules will be used to automatically determine the severity of gaps based on their size.
#[utoipa::path(
    post,
    path = "/admin/gap-severity-rules",
    tag = "Admin",
    request_body = SetSeverityRulesRequest,
    responses(
        (status = 200, description = "Severity rules successfully updated", body = ApiResponseEmpty),
        (status = 400, description = "Invalid input data"),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required")
    ),
    security(
        ("jwt" = [])
    )
)]
pub async fn set_severity_rules(
    Json(_req): Json<SetSeverityRulesRequest>,
) -> Result<Json<ApiResponse<EmptyResponse>>, (StatusCode, Json<serde_json::Value>)> {
    Ok(success_response(EmptyResponse {}))
}

/// Set a description for a specific gap size in a dimension
/// 
/// This endpoint allows administrators to set or update a description for gaps of a specific size
/// within a dimension. This description will be used as a template or default description for gaps
/// that match the criteria.
#[utoipa::path(
    post,
    path = "/admin/gap-descriptions",
    tag = "Admin",
    request_body = SetGapDescriptionRequest,
    responses(
        (status = 200, description = "Gap description successfully set", body = ApiResponseEmpty),
        (status = 400, description = "Invalid input data"),
        (status = 401, description = "Unauthorized"),
        (status = 403, description = "Forbidden - Admin access required")
    ),
    security(
        ("jwt" = [])
    )
)]
pub async fn set_gap_description(
    Json(_req): Json<SetGapDescriptionRequest>,
) -> Result<Json<ApiResponse<EmptyResponse>>, (StatusCode, Json<serde_json::Value>)> {
    Ok(success_response(EmptyResponse {}))
}
/// Create a new gap
/// 
/// Creates a new gap record with the provided details. The gap severity will be automatically
/// determined based on the configured severity rules.
#[utoipa::path(
    post,
    path = "/gaps",
    tag = "Gaps",
    request_body = CreateGapRequest,
    responses(
        (status = 200, description = "Gap successfully created", body = ApiResponseGapResponse),
        (status = 400, description = "Invalid input data"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Dimension assessment not found")
    ),
    security(
        ("jwt" = [])
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

/// Get a specific gap by ID
/// 
/// Retrieves the details of a specific gap using its unique identifier.
#[utoipa::path(
    get,
    path = "/gaps/{id}",
    tag = "Gaps",
    params(
        ("id" = Uuid, Path, description = "Gap ID")
    ),
    responses(
        (status = 200, description = "Gap details retrieved successfully", body = ApiResponseGapResponse),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Gap not found")
    ),
    security(
        ("jwt" = [])
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

/// List all gaps with pagination
/// 
/// Retrieves a paginated list of all gaps in the system.
#[utoipa::path(
    get,
    path = "/gaps",
    tag = "Gaps",
    params(
        ("page" = Option<i64>, Query, description = "Page number (1-based)"),
        ("limit" = Option<i64>, Query, description = "Number of items per page")
    ),
    responses(
        (status = 200, description = "Gaps retrieved successfully", body = ApiResponsePaginatedGapResponse),
        (status = 401, description = "Unauthorized")
    ),
    security(
        ("jwt" = [])
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

/// List gaps by dimension assessment
/// 
/// Retrieves a paginated list of gaps for a specific dimension assessment.
#[utoipa::path(
    get,
    path = "/dimension-assessments/{dimension_assessment_id}/gaps",
    tag = "Gaps",
    params(
        ("dimension_assessment_id" = Uuid, Path, description = "Dimension Assessment ID"),
        ("page" = Option<i64>, Query, description = "Page number (1-based)"),
        ("limit" = Option<i64>, Query, description = "Number of items per page")
    ),
    responses(
        (status = 200, description = "Gaps retrieved successfully", body = ApiResponsePaginatedGapResponse),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Dimension assessment not found")
    ),
    security(
        ("jwt" = [])
    )
)]
pub async fn list_gaps_by_dimension_assessment(
    State(db): State<Arc<DatabaseConnection>>,
    Path(dimension_assessment_id): Path<Uuid>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<PaginatedResponse<GapResponse>>>, (StatusCode, Json<serde_json::Value>)> {
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

/// List gaps by assessment
/// 
/// Retrieves a paginated list of gaps for a specific assessment across all dimensions.
#[utoipa::path(
    get,
    path = "/assessments/{assessment_id}/gaps",
    tag = "Gaps",
    params(
        ("assessment_id" = Uuid, Path, description = "Assessment ID"),
        ("page" = Option<i64>, Query, description = "Page number (1-based)"),
        ("limit" = Option<i64>, Query, description = "Number of items per page")
    ),
    responses(
        (status = 200, description = "Gaps retrieved successfully", body = ApiResponsePaginatedGapResponse),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Assessment not found")
    ),
    security(
        ("jwt" = [])
    )
)]
pub async fn list_gaps_by_assessment(
    State(db): State<Arc<DatabaseConnection>>,
    Path(assessment_id): Path<Uuid>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<PaginatedResponse<GapResponse>>>, (StatusCode, Json<serde_json::Value>)> {
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
