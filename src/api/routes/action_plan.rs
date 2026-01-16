use crate::{
    api::handlers::action_plan::{
        create_action_item, delete_action_item, get_action_plan_by_assessment_id,
        list_action_plans, update_action_item,
    },
    AppState,
};
use axum::{
    routing::{get, post, put},
    Router,
};

/// Create action plan routes
pub fn create_action_plan_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_action_plans))
        .route(
            "/assessment/:assessment_id",
            get(get_action_plan_by_assessment_id),
        )
        .route("/:action_plan_id/action-items", post(create_action_item))
        .route(
            "/:action_plan_id/action-items/:action_item_id",
            put(update_action_item).delete(delete_action_item),
        )
}
