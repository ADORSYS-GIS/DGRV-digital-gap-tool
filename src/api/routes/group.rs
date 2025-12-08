use axum::{
    routing::{get, post},
    Router,
};

use crate::api::handlers::{group::*, user::*};
use crate::AppState;

pub fn create_group_routes() -> Router<AppState> {
    Router::new()
        .route("/path", get(get_group_by_path))
        .route("/:group_id", get(get_group).put(update_group).delete(delete_group))
        .route("/:group_id/members", post(add_member).get(get_group_members))
}