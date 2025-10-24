use axum::{
    routing::{get, post, put, delete},
    Router,
};
use sea_orm::DatabaseConnection;

use crate::api::handlers::dimension::{
    create_dimension,
    get_dimension,
    get_dimension_with_states,
    list_dimensions,
    update_dimension,
    delete_dimension,
    create_current_state,
    update_current_state,
    create_desired_state,
    update_desired_state,
};

/// Create dimension routes
pub fn create_dimension_routes() -> Router<DatabaseConnection> {
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
        .route("/:id/current-states/:current_state_id", put(update_current_state))
        
        // Desired state operations
        .route("/:id/desired-states", post(create_desired_state))
        .route("/:id/desired-states/:desired_state_id", put(update_desired_state))
}
