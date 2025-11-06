use axum::{routing::get, Router};

use crate::api::handlers::common::health_check;

/// Create common routes (health check, etc.)
pub fn create_common_routes() -> Router {
    Router::new().route("/health", get(health_check))
}
