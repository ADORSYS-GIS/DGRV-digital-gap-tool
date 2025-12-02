use axum::{
    extract::{Path, State, Extension},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use crate::{
    api::dto::member::AddMemberRequest,
    auth::claims::Claims,
    error::{AppError, AppResult},
    AppState,
    models::keycloak::CreateUserRequest,
};
use tokio::time::{sleep, Duration};

/// Add a member to a group (cooperation)
#[utoipa::path(
    post,
    path = "/admin/groups/{group_id}/members",
    tag = "User",
    params(
        ("group_id" = String, Path, description = "Cooperation Group ID")
    ),
    request_body = AddMemberRequest,
    responses((status = 201, description = "Created"))
)]
pub async fn add_member(
    State(state): State<AppState>,
    Extension(token): Extension<String>,
    Extension(claims): Extension<Claims>,
    Path(group_id): Path<String>,
    Json(payload): Json<AddMemberRequest>,
) -> AppResult<impl IntoResponse> {
    let org_id = claims.get_organization_id().ok_or_else(|| {
        AppError::BadRequest("Organization ID not found in token".to_string())
    })?;

    // Find user by email
    let existing_user = state
        .keycloak_service
        .find_user_by_username_or_email(&token, &payload.email)
        .await?;

    let user_id = if let Some(user) = existing_user {
        user.id
    } else {
        // Create user if not exists
        let user_request = CreateUserRequest {
            username: payload.email.clone(),
            email: payload.email.clone(),
            first_name: payload.first_name,
            last_name: payload.last_name,
            email_verified: Some(true),
            enabled: Some(true),
            attributes: None,
            credentials: None,
            required_actions: None,
        };

        let new_user = state
            .keycloak_service
            .create_user_with_email_verification(&token, &user_request)
            .await?;
        new_user.id
    };

    // Add user to the organization in Keycloak
    state
        .keycloak_service
        .add_user_to_organization(&token, &org_id, &user_id)
        .await?;

    // Assign specified roles
    for role in payload.roles {
        state
            .keycloak_service
            .assign_realm_role_to_user(&token, &user_id, &role)
            .await?;

        if role == "coop_admin" {
            let client_roles = vec!["view-groups", "manage-users", "view-users", "query-users"];
            for client_role in client_roles {
                state
                    .keycloak_service
                    .assign_client_role_to_user(&token, &user_id, client_role)
                    .await?;
            }
        }
    }

    // Add user to the cooperation group
    state
        .keycloak_service
        .add_user_to_group(&token, &user_id, &group_id)
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