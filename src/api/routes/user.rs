use crate::{api::handlers::user, AppState};
use axum::{routing::delete, Router};

pub fn user_routes() -> Router<AppState> {
    Router::new().route("/:user_id", delete(user::delete_user))
}
