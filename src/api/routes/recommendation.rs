use crate::AppState;
use axum::{
    routing::{get, post},
    Router,
};

use crate::api::handlers::recommendation::{
    create_recommendation, delete_recommendation, get_recommendation, list_recommendations,
    list_recommendations_by_dimension, update_recommendation,
};

/// Create recommendation routes
pub fn create_recommendation_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_recommendation).get(list_recommendations))
        .route(
            "/:id",
            get(get_recommendation)
                .put(update_recommendation)
                .delete(delete_recommendation),
        )
        .route(
            "/dimensions/:dimension_id/recommendations",
            get(list_recommendations_by_dimension),
        )
}
