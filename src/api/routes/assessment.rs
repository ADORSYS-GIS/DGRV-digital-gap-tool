use axum::{
    routing::{delete, get, post, put},
    Router,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use crate::api::handlers::assessment::{
    create_assessment, create_dimension_assessment, delete_assessment, get_assessment,
    get_assessment_summary, list_assessments, update_assessment, update_dimension_assessment,
};

/// Create assessment routes
pub fn create_assessment_routes() -> Router<Arc<DatabaseConnection>> {
    Router::new()
        // Assessment CRUD operations
        .route("/", post(create_assessment))
        .route("/", get(list_assessments))
        .route("/:id", get(get_assessment))
        .route("/:id", put(update_assessment))
        .route("/:id", delete(delete_assessment))
        .route("/:id/summary", get(get_assessment_summary))
        // Dimension assessment operations
        .route(
            "/:id/dimension-assessments",
            post(create_dimension_assessment),
        )
        .route(
            "/:id/dimension-assessments/:dimension_assessment_id",
            put(update_dimension_assessment),
        )
}
