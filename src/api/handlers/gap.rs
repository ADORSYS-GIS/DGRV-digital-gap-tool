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
        AdminCreateGapRequest, GapResponse, GapSeverity, UpdateGapRequest,
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
/// Create a new gap (admin)
/// 
/// Accepts configuration-style payload with descriptions and severity rules.
#[utoipa::path(
    post,
    path = "/admin/gaps",
    tag = "Admin",
    request_body = AdminCreateGapRequest,
    responses(
        (status = 200, description = "Payload accepted", body = ApiResponseEmpty),
        (status = 400, description = "Invalid input data"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Dimension assessment not found")
    ),
    security(("jwt" = []))
)]
pub async fn admin_create_gap(
    State(_db): State<Arc<DatabaseConnection>>,
    Json(_request): Json<AdminCreateGapRequest>,
) -> Result<Json<ApiResponse<EmptyResponse>>, (StatusCode, Json<serde_json::Value>)> {
    // TODO: Implement processing of descriptions and rules, persisting as needed
    Ok(success_response(EmptyResponse {}))
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

/// Update an existing gap
/// 
/// Optionally updates gap size (and recalculates severity) and/or description.
#[utoipa::path(
    put,
    path = "/gaps/{id}",
    tag = "Gaps",
    params(("id" = Uuid, Path, description = "Gap ID")),
    request_body = UpdateGapRequest,
    responses(
        (status = 200, description = "Gap updated successfully", body = ApiResponseGapResponse),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Gap not found")
    ),
    security(("jwt" = []))
)]
pub async fn update_gap(
    State(db): State<Arc<DatabaseConnection>>,
    Path(gap_id): Path<Uuid>,
    Json(req): Json<UpdateGapRequest>,
) -> Result<Json<ApiResponse<GapResponse>>, (StatusCode, Json<serde_json::Value>)> {
    // Build partial ActiveModel
    let mut active = gaps::ActiveModel {
        gap_id: Set(gap_id),
        ..Default::default()
    };
    let mut new_severity: Option<crate::entities::gaps::GapSeverity> = None;
    if let Some(size) = req.gap_size {
        active.gap_size = Set(size);
        new_severity = Some(match size.abs() {
            0..=1 => crate::entities::gaps::GapSeverity::Low,
            2..=3 => crate::entities::gaps::GapSeverity::Medium,
            _ => crate::entities::gaps::GapSeverity::High,
        });
    }
    if let Some(desc) = req.gap_description {
        active.gap_description = Set(Some(desc));
    }
    if let Some(sev) = new_severity {
        active.gap_severity = Set(sev);
    }

    let updated = GapsRepository::update(db.as_ref(), gap_id, active)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    Ok(success_response_with_message(
        to_gap_response(updated),
        "Gap updated successfully".to_string(),
    ))
}

/// Delete a gap
#[utoipa::path(
    delete,
    path = "/gaps/{id}",
    tag = "Gaps",
    params(("id" = Uuid, Path, description = "Gap ID")),
    responses(
        (status = 200, description = "Gap deleted successfully", body = ApiResponseEmpty),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Gap not found")
    ),
    security(("jwt" = []))
)]
pub async fn delete_gap(
    State(db): State<Arc<DatabaseConnection>>,
    Path(gap_id): Path<Uuid>,
) -> Result<Json<ApiResponse<EmptyResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let deleted = GapsRepository::delete(db.as_ref(), gap_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;
    if !deleted {
        return Err(crate::api::handlers::common::handle_error(AppError::NotFound(
            "Gap not found".to_string(),
        )));
    }
    Ok(success_response(EmptyResponse {}))
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
