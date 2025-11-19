use axum::{
    routing::{delete, get, post},
    Router,
};
use crate::{
    api::handlers::user,
    AppState,
};

pub fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/:user_id", delete(user::delete_user))
}