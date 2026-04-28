use crate::{
    auth::claims::Claims,
    error::AppResult,
    AppState,
};
use axum::{
    extract::{Extension, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateMeRequest {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct ChangePasswordRequest {
    pub old_password: String,
    pub new_password: String,
}

/// Get current user profile from Keycloak
#[utoipa::path(
    get,
    path = "/user/me",
    tag = "User Me",
    responses(
        (status = 200, description = "Current user profile", body = crate::models::keycloak::KeycloakUser)
    ),
    security(("bearer_auth" = []))
)]
pub async fn get_me(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> AppResult<impl IntoResponse> {
    let admin_token = state.keycloak_service.get_admin_token().await?;
    let user = state
        .keycloak_service
        .get_user_by_id(&admin_token, &claims.subject)
        .await?;
    
    Ok(Json(user))
}

/// Update current user profile
#[utoipa::path(
    patch,
    path = "/user/me",
    tag = "User Me",
    request_body = UpdateMeRequest,
    responses(
        (status = 200, description = "Profile updated")
    ),
    security(("bearer_auth" = []))
)]
pub async fn update_me(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<UpdateMeRequest>,
) -> AppResult<impl IntoResponse> {
    let admin_token = state.keycloak_service.get_admin_token().await?;
    
    state
        .keycloak_service
        .update_user_profile(
            &admin_token,
            &claims.subject,
            payload.first_name,
            payload.last_name,
            None, // Don't allow changing email for now to avoid verification issues
        )
        .await?;
    
    Ok(StatusCode::OK)
}

/// Change current user password
#[utoipa::path(
    post,
    path = "/user/me/password",
    tag = "User Me",
    request_body = ChangePasswordRequest,
    responses(
        (status = 200, description = "Password changed"),
        (status = 401, description = "Invalid current password")
    ),
    security(("bearer_auth" = []))
)]
pub async fn change_password(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<ChangePasswordRequest>,
) -> AppResult<impl IntoResponse> {
    // 1. Verify old password
    let username = &claims.preferred_username;
    
    let is_valid = state
        .keycloak_service
        .verify_user_password(username, &payload.old_password)
        .await?;
    
    if !is_valid {
        return Err(crate::error::AppError::AuthError("Invalid current password".to_string()));
    }
    
    // 2. Change to new password
    let admin_token = state.keycloak_service.get_admin_token().await?;
    state
        .keycloak_service
        .reset_password(&admin_token, &claims.subject, &payload.new_password, false)
        .await?;
    
    Ok(StatusCode::OK)
}
