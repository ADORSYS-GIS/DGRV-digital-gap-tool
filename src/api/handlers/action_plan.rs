use crate::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use utoipa::IntoParams;
use uuid::Uuid;
use validator::Validate;

use crate::api::dto::{
    action_plan::{
        ActionItemResponse, ActionPlanResponse, CreateActionItemRequest, UpdateActionItemRequest,
    },
    common::{ApiResponse, PaginatedResponse, PaginationParams},
};
use crate::api::handlers::common::{extract_pagination, handle_error, success_response};
use crate::error::AppError;
use crate::repositories::action_plans::ActionPlansRepository;
use crate::services::action_plan_service::{ActionPlanService, UpdateActionItemParams};

#[derive(Debug, serde::Deserialize, IntoParams)]
pub struct ActionPlanId {
    pub action_plan_id: Uuid,
}

#[derive(Debug, serde::Deserialize, IntoParams)]
pub struct ActionItemId {
    pub action_item_id: Uuid,
}

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
    let action_plan = ActionPlansRepository::find_action_plan_with_items_by_assessment_id(
        db.as_ref(),
        assessment_id,
    )
    .await
    .map_err(crate::api::handlers::common::handle_error)?
    .ok_or_else(|| {
        crate::api::handlers::common::handle_error(AppError::NotFound(
            "Action plan not found".to_string(),
        ))
    })?;

    Ok(success_response(action_plan))
}

/// Create a new action item for a specific action plan
#[utoipa::path(
    post,
    path = "/action-plans/{action_plan_id}/action-items",
    request_body = CreateActionItemRequest,
    responses(
        (status = 201, description = "Action item created successfully", body = ApiResponseActionItemResponse),
        (status = 400, description = "Bad request"),
        (status = 404, description = "Action plan not found"),
        (status = 500, description = "Internal server error")
    ),
    tag = "Action Plans",
    params(
        ("action_plan_id" = Uuid, Path, description = "ID of the action plan")
    )
)]
pub async fn create_action_item(
    State(state): State<AppState>,
    Path(action_plan_id): Path<Uuid>,
    Json(body): Json<CreateActionItemRequest>,
) -> Result<Json<ApiResponse<ActionItemResponse>>, (StatusCode, Json<serde_json::Value>)> {
    body.validate()
        .map_err(|e| handle_error(AppError::ValidationError(e.to_string())))?;

    let db = &state.db;
    let action_plan_service = ActionPlanService::new(db.clone());

    // Check if the action plan exists
    ActionPlansRepository::find_by_id(db.as_ref(), action_plan_id)
        .await
        .map_err(handle_error)?
        .ok_or_else(|| handle_error(AppError::NotFound("Action plan not found".to_string())))?;

    let action_item = action_plan_service
        .create_action_item(
            action_plan_id,
            body.recommendation_id,
            body.dimension_assessment_id,
            body.title.clone(),       // Clone title for response
            body.description.clone(), // Clone description for response
            body.priority,
        )
        .await
        .map_err(handle_error)?;

    let response = ActionItemResponse {
        action_item_id: action_item.id,
        dimension_assessment_id: action_item.dimension_assessment_id,
        status: action_item.status.to_string(),
        priority: action_item.priority.to_string(),
        title: body.title,
        description: body.description,
        dimension: "".to_string(), // Placeholder, will be fetched in a real scenario
    };

    Ok(success_response(response))
}

/// Update an existing action item for a specific action plan
#[utoipa::path(
    put,
    path = "/action-plans/{action_plan_id}/action-items/{action_item_id}",
    request_body = UpdateActionItemRequest,
    responses(
        (status = 200, description = "Action item updated successfully", body = ApiResponseActionItemResponse),
        (status = 400, description = "Bad request"),
        (status = 404, description = "Action item or plan not found"),
        (status = 500, description = "Internal server error")
    ),
    params(
        ("action_plan_id" = Uuid, Path, description = "ID of the action plan"),
        ("action_item_id" = Uuid, Path, description = "ID of the action item to update")
    ),
    tag = "Action Plans"
)]
pub async fn update_action_item(
    State(state): State<AppState>,
    Path((action_plan_id, action_item_id)): Path<(Uuid, Uuid)>,
    Json(body): Json<UpdateActionItemRequest>,
) -> Result<Json<ApiResponse<ActionItemResponse>>, (StatusCode, Json<serde_json::Value>)> {
    body.validate()
        .map_err(|e| handle_error(AppError::ValidationError(e.to_string())))?;

    let db = &state.db;
    let action_plan_service = ActionPlanService::new(db.clone());

    // Check if the action plan exists
    ActionPlansRepository::find_by_id(db.as_ref(), action_plan_id)
        .await
        .map_err(handle_error)?
        .ok_or_else(|| handle_error(AppError::NotFound("Action plan not found".to_string())))?;

    let updated_item = action_plan_service
        .update_action_item(UpdateActionItemParams {
            action_item_id,
            action_plan_id,
            title: body.title,
            description: body.description,
            status: body.status,
            priority: body.priority,
            dimension_assessment_id: body.dimension_assessment_id,
            recommendation_id: body.recommendation_id,
        })
        .await
        .map_err(handle_error)?;

    let response = ActionItemResponse {
        action_item_id: updated_item.id,
        dimension_assessment_id: updated_item.dimension_assessment_id,
        status: updated_item.status.to_string(),
        priority: updated_item.priority.to_string(),
        title: "".to_string(), // Title and description are not directly stored in action_items
        description: "".to_string(), // They are derived from recommendations.
        dimension: "".to_string(), // Placeholder
    };

    Ok(success_response(response))
}

/// Delete an action item for a specific action plan
#[utoipa::path(
    delete,
    path = "/action-plans/{action_plan_id}/action-items/{action_item_id}",
    responses(
        (status = 204, description = "Action item deleted successfully"),
        (status = 404, description = "Action item or plan not found"),
        (status = 500, description = "Internal server error")
    ),
    params(
        ("action_plan_id" = Uuid, Path, description = "ID of the action plan"),
        ("action_item_id" = Uuid, Path, description = "ID of the action item to delete")
    ),
    tag = "Action Plans"
)]
pub async fn delete_action_item(
    State(state): State<AppState>,
    Path((action_plan_id, action_item_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let action_plan_service = ActionPlanService::new(db.clone());

    // Check if the action plan exists
    ActionPlansRepository::find_by_id(db.as_ref(), action_plan_id)
        .await
        .map_err(handle_error)?
        .ok_or_else(|| handle_error(AppError::NotFound("Action plan not found".to_string())))?;

    action_plan_service
        .delete_action_item(action_item_id, action_plan_id)
        .await
        .map_err(handle_error)?;

    Ok(success_response(()))
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
) -> Result<
    Json<ApiResponse<PaginatedResponse<ActionPlanResponse>>>,
    (StatusCode, Json<serde_json::Value>),
> {
    let db = &state.db;
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));

    let action_plans = ActionPlansRepository::find_all(db.as_ref())
        .await
        .map_err(handle_error)?;

    let mut action_plan_responses = Vec::new();
    for plan in action_plans {
        if let Some(plan_with_items) =
            ActionPlansRepository::find_action_plan_with_items_by_assessment_id(
                db.as_ref(),
                plan.assessment_id,
            )
            .await
            .map_err(handle_error)?
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
