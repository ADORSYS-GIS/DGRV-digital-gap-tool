use crate::{api::handlers::user, AppState};
use axum::{routing::{delete, put}, Router};

pub fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/:user_id", delete(user::delete_user))
        .route("/:user_id/dimensions", put(user::update_user_dimensions))
}
