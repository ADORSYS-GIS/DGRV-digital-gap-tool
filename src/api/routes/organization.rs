use axum::{
    routing::{delete, get, post, put},
    Router,
};

use crate::AppState;
use crate::api::handlers::invitation::*;
use crate::api::handlers::{group::*, organization::*};

pub fn create_organization_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_organization).get(get_organizations))
        .route("/:org_id", get(get_organization).put(update_organization).delete(delete_organization))
        .route("/:org_id/invitations", post(invite_user_to_organization))
        .route("/:org_id/members", get(get_organization_members))
        .route("/:org_id/groups", post(create_group).get(get_groups_by_organization))
        .route(
            "/:org_id/dimensions",
            post(assign_dimension_to_organization)
                .get(get_organization_dimensions)
                .put(update_organization_dimensions),
        )
        .route(
            "/:org_id/dimensions/:dimension_id",
            delete(remove_dimension_from_organization),
        )
}