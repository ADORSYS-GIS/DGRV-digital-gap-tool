use crate::{
    api::dto::member::AddMemberRequest, error::AppResult, models::keycloak::CreateUserRequest,
    AppState,
};
use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;

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
    Path(group_id): Path<String>,
    Json(payload): Json<AddMemberRequest>,
) -> AppResult<impl IntoResponse> {
    // Find user by email
    tracing::info!(
        "add_member: incoming roles={:?}, dimension_ids={:?}",
        payload.roles,
        payload.dimension_ids
    );

    let existing_user = state
        .keycloak_service
        .find_user_by_username_or_email(&token, &payload.email)
        .await?;

    // Build attributes payload if any dimensions were provided
    let dimension_attrs = payload
        .dimension_ids
        .as_ref()
        .map(|dimension_ids| serde_json::json!({ "assigned_dimensions": dimension_ids }));

    let user_id = if let Some(user) = existing_user {
        // If user exists, update attributes when provided
        if let Some(attrs) = &dimension_attrs {
            tracing::info!(
                "add_member: updating existing user {} with attrs={}",
                user.id,
                attrs
            );
            state
                .keycloak_service
                .update_user_attributes(&token, &user.id, attrs.clone(), Some(&payload.email))
                .await?;
        }
        user.id
    } else {
        // Create user if not exists
        // When creating a new user we can attach dimension-level permissions
        // as a Keycloak attribute so they can be used later for filtering.
        let user_request = CreateUserRequest {
            username: payload.email.clone(),
            email: payload.email.clone(),
            first_name: payload.first_name,
            last_name: payload.last_name,
            email_verified: Some(true),
            enabled: Some(true),
            attributes: dimension_attrs.clone(),
            credentials: None,
            required_actions: None,
        };

        let new_user = state
            .keycloak_service
            .create_user_with_email_verification(&token, &user_request)
            .await?;
        // Ensure attributes are persisted by explicitly updating after creation
        if let Some(attrs) = &dimension_attrs {
            tracing::info!(
                "add_member: updating newly created user {} with attrs={}",
                new_user.id,
                attrs
            );
            state
                .keycloak_service
                .update_user_attributes(&token, &new_user.id, attrs.clone(), Some(&payload.email))
                .await?;
        }
        new_user.id
    };

    // Assign specified roles
    for role in payload.roles {
        state
            .keycloak_service
            .assign_realm_role_to_user(&token, &user_id, &role)
            .await?;

        if role == "coop_admin" {
            // Required client roles for coop_admin
            let realm_management_roles = vec![
                "manage-users",
                "view-users",
                "query-users",
                "query-groups",
                "view-groups",
            ];
            for role in realm_management_roles {
                state
                    .keycloak_service
                    .assign_client_role_to_user(&token, &user_id, "realm-management", role)
                    .await?;
            }
        } else if role == "coop_user" {
            // Required client roles for coop_user
            let realm_management_roles = vec!["query-groups", "view-groups", "view-users"];
            for role in realm_management_roles {
                state
                    .keycloak_service
                    .assign_client_role_to_user(&token, &user_id, "realm-management", role)
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
    state.keycloak_service.delete_user(&token, &user_id).await?;
    Ok(StatusCode::NO_CONTENT)
}
