use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use uuid::Uuid;
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use crate::api::dto::{
    action_plan::*,
    common::{ApiResponse, PaginationParams, PaginatedResponse},
};
use crate::entities::{
    action_plans::ActionPlanStatus as EntityActionPlanStatus,
    action_items::{ActionItemStatus as EntityActionItemStatus, ActionItemPriority as EntityActionItemPriority},
};
use crate::api::handlers::common::{extract_pagination, success_response, success_response_with_message};
use crate::repositories::{
    action_plans::ActionPlansRepository,
    action_items::ActionItemsRepository,
};
use crate::error::AppError;

// Conversion functions between entity and DTO types
fn convert_entity_priority_to_dto(entity_priority: EntityActionItemPriority) -> ActionItemPriority {
    match entity_priority {
        EntityActionItemPriority::Low => ActionItemPriority::Low,
        EntityActionItemPriority::Medium => ActionItemPriority::Medium,
        EntityActionItemPriority::High => ActionItemPriority::High,
        EntityActionItemPriority::Urgent => ActionItemPriority::Urgent,
    }
}

fn convert_entity_status_to_dto(entity_status: EntityActionPlanStatus) -> ActionPlanStatus {
    match entity_status {
        EntityActionPlanStatus::Draft => ActionPlanStatus::Draft,
        EntityActionPlanStatus::Active => ActionPlanStatus::Active,
        EntityActionPlanStatus::Completed => ActionPlanStatus::Completed,
        EntityActionPlanStatus::Cancelled => ActionPlanStatus::Cancelled,
    }
}

fn convert_entity_item_status_to_dto(entity_status: EntityActionItemStatus) -> ActionItemStatus {
    match entity_status {
        EntityActionItemStatus::Pending => ActionItemStatus::Pending,
        EntityActionItemStatus::InProgress => ActionItemStatus::InProgress,
        EntityActionItemStatus::Completed => ActionItemStatus::Completed,
        EntityActionItemStatus::Cancelled => ActionItemStatus::Cancelled,
    }
}

fn convert_dto_priority_to_entity(dto_priority: ActionItemPriority) -> EntityActionItemPriority {
    match dto_priority {
        ActionItemPriority::Low => EntityActionItemPriority::Low,
        ActionItemPriority::Medium => EntityActionItemPriority::Medium,
        ActionItemPriority::High => EntityActionItemPriority::High,
        ActionItemPriority::Urgent => EntityActionItemPriority::High, // Map Urgent to High
    }
}

fn convert_dto_status_to_entity(dto_status: ActionPlanStatus) -> EntityActionPlanStatus {
    match dto_status {
        ActionPlanStatus::Draft => EntityActionPlanStatus::Draft,
        ActionPlanStatus::Active => EntityActionPlanStatus::Active,
        ActionPlanStatus::Completed => EntityActionPlanStatus::Completed,
        ActionPlanStatus::Cancelled => EntityActionPlanStatus::Cancelled,
    }
}

fn convert_dto_item_status_to_entity(dto_status: ActionItemStatus) -> EntityActionItemStatus {
    match dto_status {
        ActionItemStatus::Pending => EntityActionItemStatus::Pending,
        ActionItemStatus::InProgress => EntityActionItemStatus::InProgress,
        ActionItemStatus::Completed => EntityActionItemStatus::Completed,
        ActionItemStatus::Cancelled => EntityActionItemStatus::Cancelled,
    }
}

/// Create a new action plan
#[utoipa::path(
    post,
    path = "/action-plans",
    request_body = CreateActionPlanRequest,
    responses(
        (status = 200, description = "Action plan created", body = ApiResponse<ActionPlanResponse>)
    )
)]
pub async fn create_action_plan(
    State(db): State<Arc<DatabaseConnection>>,
    Json(request): Json<CreateActionPlanRequest>,
) -> Result<Json<ApiResponse<ActionPlanResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let active_model = crate::entities::action_plans::ActiveModel {
        assessment_id: sea_orm::Set(request.assessment_id),
        report_id: sea_orm::Set(request.report_id),
        title: sea_orm::Set(request.title),
        description: sea_orm::Set(request.description),
        priority: sea_orm::Set(convert_dto_priority_to_entity(request.priority.unwrap_or(ActionItemPriority::Medium))),
        target_completion_date: sea_orm::Set(request.target_completion_date),
        estimated_budget: sea_orm::Set(request.estimated_budget),
        responsible_person: sea_orm::Set(request.responsible_person),
        status: sea_orm::Set(convert_dto_status_to_entity(request.status.unwrap_or(ActionPlanStatus::Draft))),
        ..Default::default()
    };

    let action_plan = ActionPlansRepository::create(db.as_ref(), active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = ActionPlanResponse {
        action_plan_id: action_plan.action_plan_id,
        assessment_id: action_plan.assessment_id,
        report_id: action_plan.report_id,
        title: action_plan.title,
        description: action_plan.description,
        priority: convert_entity_priority_to_dto(action_plan.priority),
        target_completion_date: action_plan.target_completion_date,
        estimated_budget: action_plan.estimated_budget,
        responsible_person: action_plan.responsible_person,
        status: convert_entity_status_to_dto(action_plan.status),
        created_at: action_plan.created_at,
        updated_at: action_plan.updated_at,
    };

    Ok(success_response_with_message(response, "Action plan created successfully".to_string()))
}

/// Get action plan by ID
#[utoipa::path(
    get,
    path = "/action-plans/{id}",
    params(("id" = Uuid, Path, description = "Action plan ID")),
    responses(
        (status = 200, description = "Action plan fetched", body = ApiResponse<ActionPlanResponse>),
        (status = 404, description = "Action plan not found")
    )
)]
pub async fn get_action_plan(
    State(db): State<Arc<DatabaseConnection>>,
    Path(action_plan_id): Path<Uuid>,
) -> Result<Json<ApiResponse<ActionPlanResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let action_plan = ActionPlansRepository::find_by_id(db.as_ref(), action_plan_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| crate::api::handlers::common::handle_error(AppError::NotFound("Action plan not found".to_string())))?;

    let response = ActionPlanResponse {
        action_plan_id: action_plan.action_plan_id,
        assessment_id: action_plan.assessment_id,
        report_id: action_plan.report_id,
        title: action_plan.title,
        description: action_plan.description,
        priority: convert_entity_priority_to_dto(action_plan.priority),
        target_completion_date: action_plan.target_completion_date,
        estimated_budget: action_plan.estimated_budget,
        responsible_person: action_plan.responsible_person,
        status: convert_entity_status_to_dto(action_plan.status),
        created_at: action_plan.created_at,
        updated_at: action_plan.updated_at,
    };

    Ok(success_response(response))
}

/// Get action plan with items
#[utoipa::path(
    get,
    path = "/action-plans/{id}/with-items",
    params(("id" = Uuid, Path, description = "Action plan ID")),
    responses(
        (status = 200, description = "Action plan with items", body = ApiResponse<ActionPlanWithItemsResponse>),
        (status = 404, description = "Action plan not found")
    )
)]
pub async fn get_action_plan_with_items(
    State(db): State<Arc<DatabaseConnection>>,
    Path(action_plan_id): Path<Uuid>,
) -> Result<Json<ApiResponse<ActionPlanWithItemsResponse>>, (StatusCode, Json<serde_json::Value>)> {
    // Get action plan
    let action_plan = ActionPlansRepository::find_by_id(db.as_ref(), action_plan_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| crate::api::handlers::common::handle_error(AppError::NotFound("Action plan not found".to_string())))?;

    // Get action items
    let action_items = ActionItemsRepository::find_by_action_plan(db.as_ref(), action_plan_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let action_plan_response = ActionPlanResponse {
        action_plan_id: action_plan.action_plan_id,
        assessment_id: action_plan.assessment_id,
        report_id: action_plan.report_id,
        title: action_plan.title,
        description: action_plan.description,
        priority: convert_entity_priority_to_dto(action_plan.priority),
        target_completion_date: action_plan.target_completion_date,
        estimated_budget: action_plan.estimated_budget,
        responsible_person: action_plan.responsible_person,
        status: convert_entity_status_to_dto(action_plan.status),
        created_at: action_plan.created_at,
        updated_at: action_plan.updated_at,
    };

    let action_items_response: Vec<ActionItemResponse> = action_items
        .iter()
        .map(|ai| ActionItemResponse {
            action_item_id: ai.action_item_id,
            action_plan_id: ai.action_plan_id,
            recommendation_id: ai.recommendation_id,
            title: ai.title.clone(),
            description: ai.description.clone(),
            status: convert_entity_item_status_to_dto(ai.status.clone()),
            priority: convert_entity_priority_to_dto(ai.priority.clone()),
            estimated_effort_hours: ai.estimated_effort_hours,
            estimated_cost: ai.estimated_cost,
            target_date: ai.target_date,
            completed_date: ai.completed_date,
            assigned_to: ai.assigned_to.clone(),
            created_at: ai.created_at,
            updated_at: ai.updated_at,
        })
        .collect();

    let total_items = action_items.len() as u32;
    let completed_items = action_items
        .iter()
        .filter(|ai| ai.status == EntityActionItemStatus::Completed)
        .count() as u32;
    let progress_percentage = if total_items > 0 {
        (completed_items as f64 / total_items as f64) * 100.0
    } else {
        0.0
    };

    let response = ActionPlanWithItemsResponse {
        action_plan: action_plan_response,
        action_items: action_items_response,
        total_items,
        completed_items,
        progress_percentage,
    };

    Ok(success_response(response))
}

/// List action plans with pagination
#[utoipa::path(
    get,
    path = "/action-plans",
    params(
        ("page" = Option<u32>, Query, description = "Page number (default 1)"),
        ("limit" = Option<u32>, Query, description = "Page size (default 20)")
    ),
    responses(
        (status = 200, description = "Action plans list", body = ApiResponse<PaginatedResponse<ActionPlanResponse>>)
    )
)]
pub async fn list_action_plans(
    State(db): State<Arc<DatabaseConnection>>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<PaginatedResponse<ActionPlanResponse>>>, (StatusCode, Json<serde_json::Value>)> {
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    let offset = ((page - 1) * limit) as u64;

    let action_plans = ActionPlansRepository::find_all(db.as_ref())
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let total = action_plans.len() as u64;
    let paginated_action_plans: Vec<ActionPlanResponse> = action_plans
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .map(|action_plan| ActionPlanResponse {
            action_plan_id: action_plan.action_plan_id,
            assessment_id: action_plan.assessment_id,
            report_id: action_plan.report_id,
            title: action_plan.title,
            description: action_plan.description,
            priority: convert_entity_priority_to_dto(action_plan.priority),
            target_completion_date: action_plan.target_completion_date,
            estimated_budget: action_plan.estimated_budget,
            responsible_person: action_plan.responsible_person,
            status: convert_entity_status_to_dto(action_plan.status),
            created_at: action_plan.created_at,
            updated_at: action_plan.updated_at,
        })
        .collect();

    let response = PaginatedResponse::new(paginated_action_plans, total, page, limit);
    Ok(success_response(response))
}

/// List action plans by assessment
#[utoipa::path(
    get,
    path = "/action-plans/assessment/{assessment_id}",
    params(("assessment_id" = Uuid, Path, description = "Assessment ID")),
    responses(
        (status = 200, description = "Action plans list by assessment", body = ApiResponse<PaginatedResponse<ActionPlanResponse>>)
    )
)]
pub async fn list_action_plans_by_assessment(
    State(db): State<Arc<DatabaseConnection>>,
    Path(assessment_id): Path<Uuid>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<PaginatedResponse<ActionPlanResponse>>>, (StatusCode, Json<serde_json::Value>)> {
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    let offset = ((page - 1) * limit) as u64;

    let action_plans = ActionPlansRepository::find_by_assessment(db.as_ref(), assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let total = action_plans.len() as u64;
    let paginated_action_plans: Vec<ActionPlanResponse> = action_plans
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .map(|action_plan| ActionPlanResponse {
            action_plan_id: action_plan.action_plan_id,
            assessment_id: action_plan.assessment_id,
            report_id: action_plan.report_id,
            title: action_plan.title,
            description: action_plan.description,
            priority: convert_entity_priority_to_dto(action_plan.priority),
            target_completion_date: action_plan.target_completion_date,
            estimated_budget: action_plan.estimated_budget,
            responsible_person: action_plan.responsible_person,
            status: convert_entity_status_to_dto(action_plan.status),
            created_at: action_plan.created_at,
            updated_at: action_plan.updated_at,
        })
        .collect();

    let response = PaginatedResponse::new(paginated_action_plans, total, page, limit);
    Ok(success_response(response))
}

/// Update action plan
#[utoipa::path(
    put,
    path = "/action-plans/{id}",
    params(("id" = Uuid, Path, description = "Action plan ID")),
    request_body = UpdateActionPlanRequest,
    responses(
        (status = 200, description = "Action plan updated", body = ApiResponse<ActionPlanResponse>),
        (status = 404, description = "Action plan not found")
    )
)]
pub async fn update_action_plan(
    State(db): State<Arc<DatabaseConnection>>,
    Path(action_plan_id): Path<Uuid>,
    Json(request): Json<UpdateActionPlanRequest>,
) -> Result<Json<ApiResponse<ActionPlanResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let mut action_plan = ActionPlansRepository::find_by_id(db.as_ref(), action_plan_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| crate::api::handlers::common::handle_error(AppError::NotFound("Action plan not found".to_string())))?;

    // Update fields if provided
    if let Some(title) = request.title {
        action_plan.title = title;
    }
    if let Some(description) = request.description {
        action_plan.description = Some(description);
    }
    if let Some(priority) = request.priority {
        action_plan.priority = convert_dto_priority_to_entity(priority);
    }
    if let Some(target_completion_date) = request.target_completion_date {
        action_plan.target_completion_date = Some(target_completion_date);
    }
    if let Some(estimated_budget) = request.estimated_budget {
        action_plan.estimated_budget = Some(estimated_budget);
    }
    if let Some(responsible_person) = request.responsible_person {
        action_plan.responsible_person = Some(responsible_person);
    }
    if let Some(status) = request.status {
        action_plan.status = convert_dto_status_to_entity(status);
    }

    action_plan.updated_at = chrono::Utc::now();

    let active_model: crate::entities::action_plans::ActiveModel = action_plan.into();
    let updated_action_plan = ActionPlansRepository::update(db.as_ref(), action_plan_id, active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = ActionPlanResponse {
        action_plan_id: updated_action_plan.action_plan_id,
        assessment_id: updated_action_plan.assessment_id,
        report_id: updated_action_plan.report_id,
        title: updated_action_plan.title,
        description: updated_action_plan.description,
        priority: convert_entity_priority_to_dto(updated_action_plan.priority),
        target_completion_date: updated_action_plan.target_completion_date,
        estimated_budget: updated_action_plan.estimated_budget,
        responsible_person: updated_action_plan.responsible_person,
        status: convert_entity_status_to_dto(updated_action_plan.status),
        created_at: updated_action_plan.created_at,
        updated_at: updated_action_plan.updated_at,
    };

    Ok(success_response_with_message(response, "Action plan updated successfully".to_string()))
}

/// Delete action plan
#[utoipa::path(
    delete,
    path = "/action-plans/{id}",
    params(("id" = Uuid, Path, description = "Action plan ID")),
    responses(
        (status = 200, description = "Action plan deleted")
    )
)]
pub async fn delete_action_plan(
    State(db): State<Arc<DatabaseConnection>>,
    Path(action_plan_id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
    ActionPlansRepository::delete(db.as_ref(), action_plan_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    Ok(success_response_with_message((), "Action plan deleted successfully".to_string()))
}

/// Create action item
#[utoipa::path(
    post,
    path = "/action-plans/{id}/action-items",
    params(("id" = Uuid, Path, description = "Action plan ID")),
    request_body = CreateActionItemRequest,
    responses(
        (status = 200, description = "Action item created", body = ApiResponse<ActionItemResponse>),
        (status = 404, description = "Action plan not found")
    )
)]
pub async fn create_action_item(
    State(db): State<Arc<DatabaseConnection>>,
    Path(action_plan_id): Path<Uuid>,
    Json(request): Json<CreateActionItemRequest>,
) -> Result<Json<ApiResponse<ActionItemResponse>>, (StatusCode, Json<serde_json::Value>)> {
    // Verify action plan exists
    ActionPlansRepository::find_by_id(db.as_ref(), action_plan_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| crate::api::handlers::common::handle_error(AppError::NotFound("Action plan not found".to_string())))?;

    let active_model = crate::entities::action_items::ActiveModel {
        action_plan_id: sea_orm::Set(action_plan_id),
        recommendation_id: sea_orm::Set(request.recommendation_id),
        title: sea_orm::Set(request.title),
        description: sea_orm::Set(request.description),
        status: sea_orm::Set(convert_dto_item_status_to_entity(request.status)),
        priority: sea_orm::Set(convert_dto_priority_to_entity(request.priority)),
        estimated_effort_hours: sea_orm::Set(request.estimated_effort_hours),
        estimated_cost: sea_orm::Set(request.estimated_cost),
        target_date: sea_orm::Set(request.target_date),
        assigned_to: sea_orm::Set(request.assigned_to),
        ..Default::default()
    };

    let action_item = ActionItemsRepository::create(db.as_ref(), active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = ActionItemResponse {
        action_item_id: action_item.action_item_id,
        action_plan_id: action_item.action_plan_id,
        recommendation_id: action_item.recommendation_id,
        title: action_item.title,
        description: action_item.description,
        status: convert_entity_item_status_to_dto(action_item.status),
        priority: convert_entity_priority_to_dto(action_item.priority),
        estimated_effort_hours: action_item.estimated_effort_hours,
        estimated_cost: action_item.estimated_cost,
        target_date: action_item.target_date,
        completed_date: action_item.completed_date,
        assigned_to: action_item.assigned_to,
        created_at: action_item.created_at,
        updated_at: action_item.updated_at,
    };

    Ok(success_response_with_message(response, "Action item created successfully".to_string()))
}

/// Get action item by ID
#[utoipa::path(
    get,
    path = "/action-plans/{id}/action-items/{action_item_id}",
    params(
        ("id" = Uuid, Path, description = "Action plan ID"),
        ("action_item_id" = Uuid, Path, description = "Action item ID")
    ),
    responses(
        (status = 200, description = "Action item fetched", body = ApiResponse<ActionItemResponse>),
        (status = 404, description = "Action item not found")
    )
)]
pub async fn get_action_item(
    State(db): State<Arc<DatabaseConnection>>,
    Path((action_plan_id, action_item_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<ApiResponse<ActionItemResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let action_item = ActionItemsRepository::find_by_id(db.as_ref(), action_item_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| crate::api::handlers::common::handle_error(AppError::NotFound("Action item not found".to_string())))?;

    // Verify it belongs to the action plan
    if action_item.action_plan_id != action_plan_id {
        return Err(crate::api::handlers::common::handle_error(AppError::ValidationError("Action item does not belong to this action plan".to_string())));
    }

    let response = ActionItemResponse {
        action_item_id: action_item.action_item_id,
        action_plan_id: action_item.action_plan_id,
        recommendation_id: action_item.recommendation_id,
        title: action_item.title,
        description: action_item.description,
        status: convert_entity_item_status_to_dto(action_item.status),
        priority: convert_entity_priority_to_dto(action_item.priority),
        estimated_effort_hours: action_item.estimated_effort_hours,
        estimated_cost: action_item.estimated_cost,
        target_date: action_item.target_date,
        completed_date: action_item.completed_date,
        assigned_to: action_item.assigned_to,
        created_at: action_item.created_at,
        updated_at: action_item.updated_at,
    };

    Ok(success_response(response))
}

/// Update action item
#[utoipa::path(
    put,
    path = "/action-plans/{id}/action-items/{action_item_id}",
    params(
        ("id" = Uuid, Path, description = "Action plan ID"),
        ("action_item_id" = Uuid, Path, description = "Action item ID")
    ),
    request_body = UpdateActionItemRequest,
    responses(
        (status = 200, description = "Action item updated", body = ApiResponse<ActionItemResponse>),
        (status = 404, description = "Action item not found")
    )
)]
pub async fn update_action_item(
    State(db): State<Arc<DatabaseConnection>>,
    Path((action_plan_id, action_item_id)): Path<(Uuid, Uuid)>,
    Json(request): Json<UpdateActionItemRequest>,
) -> Result<Json<ApiResponse<ActionItemResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let mut action_item = ActionItemsRepository::find_by_id(db.as_ref(), action_item_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| crate::api::handlers::common::handle_error(AppError::NotFound("Action item not found".to_string())))?;

    // Verify it belongs to the action plan
    if action_item.action_plan_id != action_plan_id {
        return Err(crate::api::handlers::common::handle_error(AppError::ValidationError("Action item does not belong to this action plan".to_string())));
    }

    // Update fields if provided
    if let Some(title) = request.title {
        action_item.title = title;
    }
    if let Some(description) = request.description {
        action_item.description = Some(description);
    }
    if let Some(status) = request.status {
        action_item.status = convert_dto_item_status_to_entity(status);
    }
    if let Some(priority) = request.priority {
        action_item.priority = convert_dto_priority_to_entity(priority);
    }
    if let Some(estimated_effort_hours) = request.estimated_effort_hours {
        action_item.estimated_effort_hours = Some(estimated_effort_hours);
    }
    if let Some(estimated_cost) = request.estimated_cost {
        action_item.estimated_cost = Some(estimated_cost);
    }
    if let Some(target_date) = request.target_date {
        action_item.target_date = Some(target_date);
    }
    if let Some(completed_date) = request.completed_date {
        action_item.completed_date = Some(completed_date);
    }
    if let Some(assigned_to) = request.assigned_to {
        action_item.assigned_to = Some(assigned_to);
    }

    action_item.updated_at = chrono::Utc::now();

    let active_model: crate::entities::action_items::ActiveModel = action_item.into();
    let updated_action_item = ActionItemsRepository::update(db.as_ref(), action_item_id, active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = ActionItemResponse {
        action_item_id: updated_action_item.action_item_id,
        action_plan_id: updated_action_item.action_plan_id,
        recommendation_id: updated_action_item.recommendation_id,
        title: updated_action_item.title,
        description: updated_action_item.description,
        status: convert_entity_item_status_to_dto(updated_action_item.status),
        priority: convert_entity_priority_to_dto(updated_action_item.priority),
        estimated_effort_hours: updated_action_item.estimated_effort_hours,
        estimated_cost: updated_action_item.estimated_cost,
        target_date: updated_action_item.target_date,
        completed_date: updated_action_item.completed_date,
        assigned_to: updated_action_item.assigned_to,
        created_at: updated_action_item.created_at,
        updated_at: updated_action_item.updated_at,
    };

    Ok(success_response_with_message(response, "Action item updated successfully".to_string()))
}

/// Delete action item
#[utoipa::path(
    delete,
    path = "/action-plans/{id}/action-items/{action_item_id}",
    params(
        ("id" = Uuid, Path, description = "Action plan ID"),
        ("action_item_id" = Uuid, Path, description = "Action item ID")
    ),
    responses(
        (status = 200, description = "Action item deleted")
    )
)]
pub async fn delete_action_item(
    State(db): State<Arc<DatabaseConnection>>,
    Path((action_plan_id, action_item_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
    // Verify action item exists and belongs to action plan
    let action_item = ActionItemsRepository::find_by_id(db.as_ref(), action_item_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| crate::api::handlers::common::handle_error(AppError::NotFound("Action item not found".to_string())))?;

    if action_item.action_plan_id != action_plan_id {
        return Err(crate::api::handlers::common::handle_error(AppError::ValidationError("Action item does not belong to this action plan".to_string())));
    }

    ActionItemsRepository::delete(db.as_ref(), action_item_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    Ok(success_response_with_message((), "Action item deleted successfully".to_string()))
}
