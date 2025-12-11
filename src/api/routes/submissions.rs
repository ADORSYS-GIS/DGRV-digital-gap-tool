use crate::api::handlers::submission::submit_assessment;
use crate::AppState;
use axum::{routing::post, Router};

pub fn create_submission_routes() -> Router<AppState> {
    Router::new().route("/submit", post(submit_assessment))
}
