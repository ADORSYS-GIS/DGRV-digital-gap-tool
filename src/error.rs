use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] sea_orm::DbErr),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Internal server error: {0}")]
    InternalServerError(String),

    #[error("Authentication error: {0}")]
    AuthError(String),

    #[error("File storage error: {0}")]
    FileStorageError(String),

    #[error("Internal error: {0}")]
    AnyhowError(#[from] anyhow::Error),

    #[error("Level id already assigned to another state")]
    LevelIdAlreadyExists,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_code, error_message) = match self {
            AppError::DatabaseError(db_err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "DATABASE_ERROR",
                db_err.to_string(),
            ),
            AppError::ValidationError(msg) => (StatusCode::BAD_REQUEST, "VALIDATION_ERROR", msg),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, "NOT_FOUND", msg),
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, "UNAUTHORIZED", msg),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, "BAD_REQUEST", msg),
            AppError::InternalServerError(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                msg,
            ),
            AppError::AuthError(msg) => (StatusCode::UNAUTHORIZED, "AUTHENTICATION_ERROR", msg),
            AppError::FileStorageError(msg) => {
                (StatusCode::INTERNAL_SERVER_ERROR, "FILE_STORAGE_ERROR", msg)
            }
            AppError::AnyhowError(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR",
                err.to_string(),
            ),
            AppError::LevelIdAlreadyExists => (
                StatusCode::CONFLICT,
                "LEVEL_ID_ALREADY_EXISTS",
                "Level id already assigned to another state".to_string(),
            ),
        };

        let body = Json(json!({
          "error_code": error_code,
          "message": error_message,
        }));

        (status, body).into_response()
    }
}

pub type AppResult<T> = Result<T, AppError>;
