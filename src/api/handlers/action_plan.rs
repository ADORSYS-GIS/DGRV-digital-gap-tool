use crate::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use uuid::Uuid;

use crate::api::dto::{
    action_plan::ActionPlanResponse,
    common::{ApiResponse, PaginatedResponse, PaginationParams},
};
use crate::api::handlers::common::{extract_pagination, success_response};
use crate::error::AppError;
use crate::repositories::action_plans::ActionPlansRepository;

/// Get action plan by assessment ID
#[utoipa::path(
    get,
    path = "/action-plans/assessment/{assessment_id}",
    params(("assessment_id" = Uuid, Path, description = "Assessment ID")),
    responses(
        (status = 200, description = "Action plan fetched successfully", body = ApiResponseActionPlanResponse),
        (status = 404, description = "Action plan not found")
    )
)]
pub async fn get_action_plan_by_assessment_id(
    State(state): State<AppState>,
    Path(assessment_id): Path<Uuid>,
) -> Result<Json<ApiResponse<ActionPlanResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let action_plan =
        ActionPlansRepository::find_action_plan_with_items_by_assessment_id(db.as_ref(), assessment_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?
            .ok_or_else(|| {
                crate::api::handlers::common::handle_error(AppError::NotFound(
                    "Action plan not found".to_string(),
                ))
            })?;

    Ok(success_response(action_plan))
}



#[utoipa::path(
    get,
    path = "/action-plans",
    params(
        ("page" = Option<u32>, Query, description = "Page number (default 1)"),
        ("limit" = Option<u32>, Query, description = "Page size (default 20)")
    ),
    responses(
        (status = 200, description = "Action plans fetched successfully", body = ApiResponsePaginatedActionPlanResponse),
    )
)]
pub async fn list_action_plans(
    State(state): State<AppState>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<PaginatedResponse<ActionPlanResponse>>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));

    let action_plans = ActionPlansRepository::find_all(db.as_ref())
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let mut action_plan_responses = Vec::new();
    for plan in action_plans {
        if let Some(plan_with_items) =
            ActionPlansRepository::find_action_plan_with_items_by_assessment_id(
                db.as_ref(),
                plan.assessment_id,
            )
            .await
            .map_err(crate::api::handlers::common::handle_error)?
        {
            action_plan_responses.push(plan_with_items);
        }
    }

    let total = action_plan_responses.len() as u64;
    let offset = ((page - 1) * limit) as u64;

    let paginated_action_plans: Vec<ActionPlanResponse> = action_plan_responses
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .collect();

    let response = PaginatedResponse::new(paginated_action_plans, total, page, limit);
    Ok(success_response(response))
}

