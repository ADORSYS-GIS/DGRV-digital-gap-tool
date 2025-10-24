use axum::{
    http::StatusCode,
    response::Json,
    extract::Query,
};
use serde_json::json;
use crate::api::dto::common::{ApiResponse, PaginationParams};
use crate::error::AppError;

/// Health check endpoint
pub async fn health_check() -> Json<serde_json::Value> {
    Json(json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now(),
        "service": "dgat-backend"
    }))
}

/// Handle application errors and convert them to appropriate HTTP responses
pub fn handle_error(error: AppError) -> (StatusCode, Json<serde_json::Value>) {
    let (status_code, message) = match error {
        AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
        AppError::ValidationError(msg) => (StatusCode::BAD_REQUEST, msg),
        AppError::DatabaseError(db_err) => (StatusCode::INTERNAL_SERVER_ERROR, db_err.to_string()),
        AppError::FileStorageError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg),
        AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
        AppError::InternalServerError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        AppError::AuthError(msg) => (StatusCode::UNAUTHORIZED, msg),
    };

    let response = ApiResponse::<()>::error(message);
    (status_code, Json(serde_json::to_value(response).unwrap()))
}

/// Extract pagination parameters from query string
pub fn extract_pagination(query: Query<PaginationParams>) -> (u32, u32, String, String) {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100).max(1);
    let sort_by = query.sort_by.clone().unwrap_or_else(|| "created_at".to_string());
    let sort_order = match &query.sort_order {
        Some(order) => match order {
            crate::api::dto::common::SortOrder::Asc => "ASC".to_string(),
            crate::api::dto::common::SortOrder::Desc => "DESC".to_string(),
        },
        None => "DESC".to_string(),
    };
    
    (page, limit, sort_by, sort_order)
}

/// Create a success response
pub fn success_response<T: serde::Serialize>(data: T) -> Json<ApiResponse<T>> {
    Json(ApiResponse::success(data))
}

/// Create a success response with message
pub fn success_response_with_message<T: serde::Serialize>(data: T, message: String) -> Json<ApiResponse<T>> {
    Json(ApiResponse::success_with_message(data, message))
}

/// Create an error response
pub fn error_response(message: String) -> Json<ApiResponse<()>> {
    Json(ApiResponse::error(message))
}
