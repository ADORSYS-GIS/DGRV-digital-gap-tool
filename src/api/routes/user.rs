use axum::{
    routing::delete,
    Router,
};
use crate::{
    api::handlers::user,
    AppState,
};

pub fn user_routes() -> Router<AppState> {
    Router::new().route("/:user_id", delete(user::delete_user))
}