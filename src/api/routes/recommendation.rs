use axum::{
    extract::{Path, Query, State},
    Json,
};
use uuid::Uuid;

use crate::api::dto::{
    common::PaginationParams,
    recommendation::{CreateRecommendationRequest, RecommendationResponse, UpdateRecommendationRequest},
};
use crate::api::handlers::recommendation::{
    create_recommendation, delete_recommendation, get_recommendation, list_recommendations,
    list_recommendations_by_dimension, update_recommendation,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

/// Create a new recommendation
pub async fn create_route(
    State(db): State<Arc<DatabaseConnection>>,
    Json(payload): Json<CreateRecommendationRequest>,
) -> Result<Json<crate::api::dto::common::ApiResponse<RecommendationResponse>>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    create_recommendation(State(db), Json(payload)).await
}

/// Get a specific recommendation by ID
pub async fn get_route(
    Path(id): Path<Uuid>,
    State(db): State<Arc<DatabaseConnection>>,
) -> Result<Json<crate::api::dto::common::ApiResponse<RecommendationResponse>>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    get_recommendation(State(db), Path(id)).await
}

/// Update a recommendation
pub async fn update_route(
    Path(id): Path<Uuid>,
    State(db): State<Arc<DatabaseConnection>>,
    Json(payload): Json<UpdateRecommendationRequest>,
) -> Result<Json<crate::api::dto::common::ApiResponse<RecommendationResponse>>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    update_recommendation(State(db), Path(id), Json(payload)).await
}

/// Delete a recommendation
pub async fn delete_route(
    Path(id): Path<Uuid>, 
    State(db): State<Arc<DatabaseConnection>>
) -> Result<Json<crate::api::dto::common::ApiResponse<crate::api::dto::common::EmptyResponse>>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    delete_recommendation(State(db), Path(id)).await
}

/// List all recommendations with pagination
pub async fn list_route(
    Query(params): Query<PaginationParams>,
    State(db): State<Arc<DatabaseConnection>>,
) -> Result<Json<crate::api::dto::common::ApiResponse<crate::api::dto::common::PaginatedResponse<RecommendationResponse>>>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    list_recommendations(State(db), Query(params)).await
}

/// List recommendations for a specific dimension with pagination
pub async fn list_by_dimension_route(
    Path(dimension_id): Path<Uuid>,
    Query(params): Query<PaginationParams>,
    State(db): State<Arc<DatabaseConnection>>,
) -> Result<Json<crate::api::dto::common::ApiResponse<crate::api::dto::common::PaginatedResponse<RecommendationResponse>>>, (axum::http::StatusCode, Json<serde_json::Value>)> {
    list_recommendations_by_dimension(State(db), Path(dimension_id), Query(params)).await
}

/// Create the recommendation router
pub fn create_recommendation_router() -> axum::Router<Arc<DatabaseConnection>> {
    use axum::routing::{get, post};

    axum::Router::new()
        .route("/", post(create_route).get(list_route))
        .route(
            "/:id",
            get(get_route)
                .put(update_route)
                .delete(delete_route),
        )
        .route(
            "/dimensions/:dimension_id",
            get(list_by_dimension_route),
        )
}
