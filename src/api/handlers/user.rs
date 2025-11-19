use axum::{
    extract::{Path, State, Extension, Query},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use crate::{
    api::dto::member::AddMemberRequest,
    error::AppResult,
    AppState, models::keycloak::CreateUserRequest,
};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct AddMemberParams {
    redirect_uri: Option<String>,
}

/// Add a member to a group
#[utoipa::path(
    post,
    path = "/admin/groups/{group_id}/members",
    tag = "User",
    params(
        ("group_id" = String, Path, description = "Group ID"),
        ("redirect_uri" = Option<String>, Query, description = "Redirect URI for email verification")
    ),
    request_body = AddMemberRequest,
    responses((status = 201, description = "Created"))
)]
pub async fn add_member(
    State(state): State<AppState>,
    Extension(token): Extension<String>,
    Path(group_id): Path<String>,
    Query(params): Query<AddMemberParams>,
    Json(payload): Json<AddMemberRequest>,
) -> AppResult<impl IntoResponse> {
    let user_request = CreateUserRequest {
        username: payload.email.clone(),
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email_verified: Some(false),
        enabled: Some(true),
        attributes: None,
        credentials: None,
        required_actions: None,
    };

    let user_id = state
        .keycloak_service
        .create_user(&token, &user_request)
        .await?;

    for role in payload.roles {
        state
            .keycloak_service
            .assign_realm_role_to_user(&token, &user_id, &role)
            .await?;
    }

    state
        .keycloak_service
        .add_user_to_group(&token, &user_id, &group_id)
        .await?;

    state
        .keycloak_service
        .trigger_email_verification(&token, &user_id, params.redirect_uri.as_deref())
        .await?;

    Ok(StatusCode::CREATED)
}

/// Get all members of a group
#[utoipa::path(
    get,
    path = "/admin/groups/{group_id}/members",
    tag = "User",
    params(("group_id" = String, Path, description = "Group ID")),
    responses((status = 200, description = "OK", body = Vec<KeycloakUser>))
)]
pub async fn get_group_members(
    State(state): State<AppState>,
    Extension(token): Extension<String>,
    Path(group_id): Path<String>,
) -> AppResult<impl IntoResponse> {
    let members = state
        .keycloak_service
        .get_group_members(&token, &group_id)
        .await?;
    Ok(Json(members))
}


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