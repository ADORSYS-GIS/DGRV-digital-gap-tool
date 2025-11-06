use axum::{
    routing::{delete, get, post, put},
    Router,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use crate::api::handlers::dimension::{
    create_current_state, create_desired_state, create_dimension, delete_dimension, get_dimension,
    get_dimension_with_states, list_dimensions, update_current_state, update_desired_state,
    update_dimension,
};

/// Create dimension routes
pub fn create_dimension_routes() -> Router<Arc<DatabaseConnection>> {
    Router::new()
        // Dimension CRUD operations
        .route("/", post(create_dimension))
        .route("/", get(list_dimensions))
        .route("/:id", get(get_dimension))
        .route("/:id", put(update_dimension))
        .route("/:id", delete(delete_dimension))
        .route("/:id/with-states", get(get_dimension_with_states))
        // Current state operations
        .route("/:id/current-states", post(create_current_state))
        .route(
            "/:id/current-states/:current_state_id",
            put(update_current_state),
        )
        // Desired state operations
        .route("/:id/desired-states", post(create_desired_state))
        .route(
            "/:id/desired-states/:desired_state_id",
            put(update_desired_state),
        )
}
