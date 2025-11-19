use axum::{
    extract::{Path, State, Extension},
    http::StatusCode,
    response::IntoResponse,
};
use crate::{
    error::AppResult,
    AppState,
};

/// Delete a user by ID
#[utoipa::path(
    delete,
    path = "/admin/users/{user_id}",
    tag = "User",
    params(("user_id" = String, Path, description = "User ID")),
    responses((status = 204, description = "No Content"))
)]
pub async fn delete_user(
    State(state): State<AppState>,
    Extension(token): Extension<String>,
    Path(user_id): Path<String>,
) -> AppResult<impl IntoResponse> {
    state
        .keycloak_service
        .delete_user(&token, &user_id)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}