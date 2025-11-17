
use crate::web::api::handlers::{
    organizations::{
        create_organization, get_organizations, get_organization, update_organization, delete_organization,
    },
};

use axum::{
    routing::{delete, get, post, put},
    Router,
};
use crate::web::routes::AppState;

pub fn create_router(app_state: AppState) -> Router {
    Router::new()
        // Organization endpoints matching OpenAPI specification
        .route("/api/admin/organizations", post(create_organization).get(get_organizations))
        .route("/api/admin/organizations/:org_id", get(get_organization).put(update_organization).delete(delete_organization))
        .with_state(app_state)
}
