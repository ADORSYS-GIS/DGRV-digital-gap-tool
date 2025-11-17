use axum::{routing::get, Router};
use crate::AppState;
use crate::api::handlers::action_plan::*;

/// Create action plan routes
pub fn create_action_plan_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_action_plans))
        .route(
            "/assessment/:assessment_id",
            get(get_action_plan_by_assessment_id),
        )
}
