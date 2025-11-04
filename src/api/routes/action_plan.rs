use axum::{
    routing::{delete, get, post, put},
    Router,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use crate::api::handlers::action_plan::{
    create_action_item, create_action_plan, delete_action_item, delete_action_plan,
    get_action_item, get_action_plan, get_action_plan_with_items, list_action_plans,
    list_action_plans_by_assessment, update_action_item, update_action_plan,
};

/// Create action plan routes
pub fn create_action_plan_routes() -> Router<Arc<DatabaseConnection>> {
    Router::new()
        // Action plan CRUD operations
        .route("/", post(create_action_plan))
        .route("/", get(list_action_plans))
        .route("/:id", get(get_action_plan))
        .route("/:id", put(update_action_plan))
        .route("/:id", delete(delete_action_plan))
        .route("/:id/with-items", get(get_action_plan_with_items))
        // Assessment-specific action plans
        .route(
            "/assessment/:assessment_id",
            get(list_action_plans_by_assessment),
        )
        // Action item operations
        .route("/:id/action-items", post(create_action_item))
        .route("/:id/action-items/:action_item_id", get(get_action_item))
        .route("/:id/action-items/:action_item_id", put(update_action_item))
        .route(
            "/:id/action-items/:action_item_id",
            delete(delete_action_item),
        )
}
