use axum::{
    routing::{delete, get, post, put},
    Router,
};

use crate::AppState;
use crate::api::handlers::organization::*;

pub fn create_organization_routes() -> Router<AppState> {
    Router::new()
        .route(
            "/",
            post(create_organization).get(get_organizations),
        )
        .route(
            "/:org_id",
            get(get_organization)
                .put(update_organization)
                .delete(delete_organization),
        )
}