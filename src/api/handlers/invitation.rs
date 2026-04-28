use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;

use crate::api::dto::invitation::{UserInvitationRequest, UserInvitationResponse};
use crate::auth::claims::Claims;
use crate::error::AppError;
use crate::models::keycloak::CreateUserRequest;
use crate::AppState;

fn get_token_from_extensions(token: &str) -> Result<String, AppError> {
    Ok(token.to_string())
}

/// Get pending invitations for an organization
#[utoipa::path(
    get,
    path = "/admin/organizations/{org_id}/invitations",
    tag = "Organization",
    params(("org_id" = String, Path, description = "Organization ID")),
    responses((status = 200, description = "OK", body = Vec<PendingInvitation>))
)]
pub async fn get_organization_invitations(
    Extension(_claims): Extension<Claims>,
    State(app_state): State<AppState>,
    Path(org_id): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let admin_token = app_state.keycloak_service.get_admin_token().await?;
    let invitations = app_state
        .keycloak_service
        .get_organization_invitations(&admin_token, &org_id)
        .await
        .unwrap_or_default();
    Ok((StatusCode::OK, Json(invitations)))
}

/// Delete a pending invitation
pub async fn delete_organization_invitation(
    Extension(claims): Extension<Claims>,
    State(app_state): State<AppState>,
    Path((org_id, invitation_id)): Path<(String, String)>,
) -> Result<impl IntoResponse, AppError> {
    if !claims.is_application_admin() {
        return Err(AppError::BadRequest("Insufficient permissions".to_string()));
    }
    let admin_token = app_state.keycloak_service.get_admin_token().await?;

    // Try to delete from Keycloak's invitation system (best effort)
    let _ = app_state
        .keycloak_service
        .delete_organization_invitation(&admin_token, &org_id, &invitation_id)
        .await;

    // Also clear the invited_organization attribute
    let _ = app_state
        .keycloak_service
        .update_user_attributes(
            &admin_token, 
            &invitation_id, 
            serde_json::json!({ "invited_organization": [] }), // Empty array to clear
            None
        )
        .await;

    Ok(StatusCode::NO_CONTENT)
}

/// Resend a pending invitation
pub async fn resend_organization_invitation(
    Extension(claims): Extension<Claims>,
    State(app_state): State<AppState>,
    Path((org_id, invitation_id)): Path<(String, String)>,
) -> Result<impl IntoResponse, AppError> {
    if !claims.is_application_admin() {
        return Err(AppError::BadRequest("Insufficient permissions".to_string()));
    }
    let admin_token = app_state.keycloak_service.get_admin_token().await?;
    app_state
        .keycloak_service
        .resend_organization_invitation(&admin_token, &org_id, &invitation_id)
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;
    Ok(StatusCode::NO_CONTENT)
}

/// Invite a user to an organization
#[utoipa::path(
    post,
    path = "/admin/organizations/{org_id}/invitations",
    tag = "Organization",
    params(("org_id" = String, Path, description = "Organization ID")),
    request_body = UserInvitationRequest,
    responses((status = 201, description = "Created", body = UserInvitationResponse))
)]
pub async fn invite_user_to_organization(
    Extension(claims): Extension<Claims>,
    Extension(token): Extension<String>,
    State(app_state): State<AppState>,
    Path(org_id): Path<String>,
    Json(request): Json<UserInvitationRequest>,
) -> Result<impl IntoResponse, AppError> {
    tracing::info!(
        ?request,
        "Received user invitation request for organization {}",
        org_id
    );
    let _token = get_token_from_extensions(&token)?;

    if !claims.is_application_admin() {
        return Err(AppError::BadRequest("Insufficient permissions".to_string()));
    }

    let admin_token = app_state.keycloak_service.get_admin_token().await?;

    // Check if user already exists
    let existing_user = app_state
        .keycloak_service
        .find_user_by_username_or_email(&admin_token, &request.email)
        .await
        .map_err(|e| {
            tracing::error!("Failed to find user: {}", e);
            AppError::InternalServerError("Failed to find user".to_string())
        })?;

    let user = if let Some(user) = existing_user {
        user
    } else {
        // Create user if not exists with the invitation attribute
        let initial_attrs = json!({ "invited_organization": [org_id.clone()] });
        let create_user_request = CreateUserRequest {
            username: request.email.clone(),
            email: request.email.clone(),
            first_name: request.first_name.clone(),
            last_name: request.last_name.clone(),
            email_verified: Some(false),
            enabled: Some(true),
            attributes: Some(initial_attrs),
            credentials: None,
            required_actions: Some(vec!["VERIFY_EMAIL".to_string()]),
        };

        let new_user = app_state
            .keycloak_service
            .create_user_with_email_verification(&admin_token, &create_user_request)
            .await
            .map_err(|e| {
                tracing::error!("Failed to create user: {}", e);
                AppError::InternalServerError("Failed to create user".to_string())
            })?;
        
        // Explicitly update attributes after creation to ensure persistence (following pattern in user.rs)
        let _ = app_state
            .keycloak_service
            .update_user_attributes(
                &admin_token, 
                &new_user.id, 
                json!({ "invited_organization": [org_id.clone()] }),
                Some(&request.email)
            )
            .await;
        
        new_user
    };

    // Assign roles
    app_state
        .keycloak_service
        .assign_realm_role_to_user(&admin_token, &user.id, "org_admin")
        .await?;

    let realm_management_roles = vec![
        "view-users",
        "query-users",
        "manage-users",
        "manage-organizations",
        "manage-clients",
        "manage-realm",
    ];

    for role in realm_management_roles {
        app_state
            .keycloak_service
            .assign_client_role_to_user(&admin_token, &user.id, "realm-management", role)
            .await?;
    }

    // Store the invited org on the user so we can filter pending invitations per org
    if let Err(e) = app_state
        .keycloak_service
        .update_user_attributes(
            &admin_token, 
            &user.id, 
            json!({ "invited_organization": [org_id.clone()] }),
            Some(&user.email)
        )
        .await
    {
        tracing::error!(error = %e, user_id = %user.id, "Failed to set invited_organization attribute on user");
    }

    // Create invitation
    match app_state
        .keycloak_service
        .create_invitation(
            &admin_token,
            &org_id,
            &request.email,
            request.first_name.as_deref(),
            request.last_name.as_deref(),
            request.roles.clone(),
            None,
        )
        .await
    {
        Ok(_invitation) => {
            let response = UserInvitationResponse {
                user_id: user.id,
                email: user.email,
                status: "pending_org_invitation".to_string(),
                message: "Invitation sent successfully".to_string(),
            };
            Ok((StatusCode::CREATED, Json(response)))
        }
        Err(e) => {
            tracing::error!("Failed to create invitation: {}", e);
            Err(AppError::InternalServerError(
                "Failed to create invitation".to_string(),
            ))
        }
    }
}
