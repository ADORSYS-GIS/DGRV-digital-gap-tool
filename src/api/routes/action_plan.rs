use axum::{routing::get, Router};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use crate::api::handlers::action_plan::{
    get_action_plan_by_assessment_id, list_action_plans,
};

/// Create action plan routes
pub fn create_action_plan_routes() -> Router<Arc<DatabaseConnection>> {
    Router::new()
        .route("/", get(list_action_plans))
        .route(
            "/assessment/:assessment_id",
            get(get_action_plan_by_assessment_id),
        )
}
