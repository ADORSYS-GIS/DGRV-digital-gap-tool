use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use sea_orm::{DatabaseConnection, ActiveValue::Set};
use std::sync::Arc;
use uuid::Uuid;

use crate::api::dto::{
    common::{ApiResponse, EmptyResponse, PaginatedResponse, PaginationParams},
    recommendation::{CreateRecommendationRequest, RecommendationResponse, UpdateRecommendationRequest},
};
use crate::api::handlers::common::{
    extract_pagination, success_response,
};
use crate::entities::recommendations;
use crate::repositories::recommendations::RecommendationsRepository;

fn to_recommendation_response(model: recommendations::Model) -> RecommendationResponse {
    RecommendationResponse {
        recommendation_id: model.recommendation_id,
        dimension_id: model.dimension_id,
        priority: model.priority.into(),
        description: model.description,
        created_at: model.created_at,
        updated_at: model.updated_at,
    }
}

/// Create a new recommendation
/// 
/// Creates a new recommendation with the provided details.
#[utoipa::path(
    post,
    path = "/recommendations",
    request_body = CreateRecommendationRequest,
    responses(
        (status = 201, description = "Recommendation created successfully", body = ApiResponseRecommendationResponse),
        (status = 400, description = "Invalid input data"),
        (status = 500, description = "Internal server error")
    ),
    tag = "recommendations"
)]
pub async fn create_recommendation(
    State(db): State<Arc<DatabaseConnection>>,
    Json(payload): Json<CreateRecommendationRequest>,
) -> Result<Json<ApiResponse<RecommendationResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let recommendation = recommendations::ActiveModel {
        recommendation_id: Set(Uuid::new_v4()),
        dimension_id: Set(payload.dimension_id),
        priority: Set(payload.priority.into()),
        description: Set(payload.description),
        created_at: Set(chrono::Utc::now()),
        updated_at: Set(chrono::Utc::now()),
    };

    let recommendation = RecommendationsRepository::create(&db, recommendation)
        .await
        .map_err(|e| {
            let error_response = serde_json::json!({
                "status": "error",
                "message": format!("Failed to create recommendation: {}", e)
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    let response = success_response(to_recommendation_response(recommendation));
    
    Ok(response)
}

/// Get a specific recommendation by ID
/// 
/// Retrieves the details of a specific recommendation using its unique identifier.
#[utoipa::path(
    get,
    path = "/recommendations/{id}",
    params(
        ("id" = Uuid, Path, description = "Recommendation ID")
    ),
    responses(
        (status = 200, description = "Recommendation found", body = ApiResponseRecommendationResponse),
        (status = 404, description = "Recommendation not found"),
        (status = 500, description = "Internal server error")
    ),
    tag = "recommendations"
)]
pub async fn get_recommendation(
    State(db): State<Arc<DatabaseConnection>>,
    Path(recommendation_id): Path<Uuid>,
) -> Result<Json<ApiResponse<RecommendationResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let recommendation = RecommendationsRepository::find_by_id(&db, recommendation_id)
        .await
        .map_err(|e| {
            let error_response = serde_json::json!({
                "status": "error",
                "message": format!("Failed to fetch recommendation: {}", e)
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    match recommendation {
        Some(rec) => {
            let response = success_response(to_recommendation_response(rec));
            
            Ok(response)
        }
        None => {
            let error_response = serde_json::json!({
                "status": "error",
                "message": "Recommendation not found"
            });
            Err((StatusCode::NOT_FOUND, Json(error_response)))
        }
    }
}

/// Update an existing recommendation
/// 
/// Updates the priority and/or description of an existing recommendation.
#[utoipa::path(
    put,
    path = "/recommendations/{id}",
    params(
        ("id" = Uuid, Path, description = "Recommendation ID")
    ),
    request_body = UpdateRecommendationRequest,
    responses(
        (status = 200, description = "Recommendation updated successfully", body = ApiResponseRecommendationResponse),
        (status = 400, description = "Invalid input data"),
        (status = 404, description = "Recommendation not found"),
        (status = 500, description = "Internal server error")
    ),
    tag = "recommendations"
)]
pub async fn update_recommendation(
    State(db): State<Arc<DatabaseConnection>>,
    Path(recommendation_id): Path<Uuid>,
    Json(payload): Json<UpdateRecommendationRequest>,
) -> Result<Json<ApiResponse<RecommendationResponse>>, (StatusCode, Json<serde_json::Value>)> {
    // First, fetch the existing recommendation
    let existing = RecommendationsRepository::find_by_id(&db, recommendation_id)
        .await
        .map_err(|e| {
            let error_response = serde_json::json!({
                "status": "error",
                "message": format!("Failed to fetch recommendation: {}", e)
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?
        .ok_or_else(|| {
            let error_response = serde_json::json!({
                "status": "error",
                "message": "Recommendation not found"
            });
            (StatusCode::NOT_FOUND, Json(error_response))
        })?;

    // Create an active model from the existing recommendation
    let mut recommendation: recommendations::ActiveModel = existing.into();

    // Update fields if they are provided in the request
    if let Some(priority) = payload.priority {
        recommendation.priority = Set(priority.into());
    }
    if let Some(description) = payload.description {
        recommendation.description = Set(description);
    }
    
    // Update the updated_at timestamp
    recommendation.updated_at = Set(chrono::Utc::now());

    // Save the updated recommendation
    let updated_recommendation = RecommendationsRepository::update(&db, recommendation_id, recommendation)
        .await
        .map_err(|e| {
            let error_response = serde_json::json!({
                "status": "error",
                "message": format!("Failed to update recommendation: {}", e)
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    let response = success_response(to_recommendation_response(updated_recommendation));
    
    Ok(response)
}

/// Delete a recommendation
/// 
/// Deletes a recommendation by its ID.
#[utoipa::path(
    delete,
    path = "/recommendations/{id}",
    params(
        ("id" = Uuid, Path, description = "Recommendation ID")
    ),
    responses(
        (status = 200, description = "Recommendation deleted successfully", body = ApiResponseEmpty),
        (status = 404, description = "Recommendation not found"),
        (status = 500, description = "Internal server error")
    ),
    tag = "recommendations"
)]
pub async fn delete_recommendation(
    State(db): State<Arc<DatabaseConnection>>,
    Path(recommendation_id): Path<Uuid>,
) -> Result<Json<ApiResponse<EmptyResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let deleted = RecommendationsRepository::delete(&db, recommendation_id)
        .await
        .map_err(|e| {
            let error_response = serde_json::json!({
                "status": "error",
                "message": format!("Failed to delete recommendation: {}", e)
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    if !deleted {
        let error_response = serde_json::json!({
            "status": "error",
            "message": "Recommendation not found"
        });
        return Err((StatusCode::NOT_FOUND, Json(error_response)));
    }

    let response = success_response(EmptyResponse {});
    
    Ok(response)
}

/// List all recommendations with pagination
/// 
/// Retrieves a paginated list of all recommendations in the system.
#[utoipa::path(
    get,
    path = "/recommendations",
    params(
        ("page" = Option<i64>, Query, description = "Page number (starts from 1)"),
        ("page_size" = Option<i64>, Query, description = "Number of items per page (default: 10, max: 100)")
    ),
    responses(
        (status = 200, description = "List of recommendations", body = ApiResponsePaginatedRecommendationResponse),
        (status = 500, description = "Internal server error")
    ),
    tag = "recommendations"
)]
pub async fn list_recommendations(
    State(db): State<Arc<DatabaseConnection>>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<PaginatedResponse<RecommendationResponse>>>, (StatusCode, Json<serde_json::Value>)> {
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    
    let (recommendations, total) = RecommendationsRepository::find_all_paginated(&db, page as u64, limit as u64)
        .await
        .map_err(|e| {
            let error_response = serde_json::json!({
                "status": "error",
                "message": format!("Failed to fetch recommendations: {}", e)
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    let response = success_response(PaginatedResponse {
        items: recommendations.into_iter().map(to_recommendation_response).collect(),
        total,
        page,
        limit,
        total_pages: (total as f64 / limit as f64).ceil() as u32,
    });
    
    Ok(response)
}

/// List recommendations by dimension
/// 
/// Retrieves a paginated list of recommendations for a specific dimension.
#[utoipa::path(
    get,
    path = "/dimensions/{id}/recommendations",
    params(
        ("id" = Uuid, Path, description = "Dimension ID"),
        ("page" = Option<i64>, Query, description = "Page number (starts from 1)"),
        ("page_size" = Option<i64>, Query, description = "Number of items per page (default: 10, max: 100)")
    ),
    responses(
        (status = 200, description = "List of recommendations for the dimension", body = ApiResponsePaginatedRecommendationResponse),
        (status = 500, description = "Internal server error")
    ),
    tag = "recommendations"
)]
pub async fn list_recommendations_by_dimension(
    State(db): State<Arc<DatabaseConnection>>,
    Path(dimension_id): Path<Uuid>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<ApiResponse<PaginatedResponse<RecommendationResponse>>>, (StatusCode, Json<serde_json::Value>)> {
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    
    let (recommendations, total) = RecommendationsRepository::find_by_dimension_paginated(
        &db, dimension_id, page as u64, limit as u64
    )
    .await
    .map_err(|e| {
        let error_response = serde_json::json!({
            "status": "error",
            "message": format!("Failed to fetch recommendations: {}", e)
        });
        (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
    })?;

    let response = success_response(PaginatedResponse {
        items: recommendations.into_iter().map(to_recommendation_response).collect(),
        total,
        page: page as u32,
        limit: limit as u32,
        total_pages: (total as f64 / limit as f64).ceil() as u32,
    });
    
    Ok(response)
}
