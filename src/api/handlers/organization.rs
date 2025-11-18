use crate::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};

use crate::{
    api::dto::organization::{
        OrganizationCreateRequest, OrganizationUpdateRequest,
    },
    error::{AppError, AppResult},
};

// Create a new organization
/// Create organization
#[utoipa::path(
    post,
    path = "/admin/organizations",
    tag = "Organization",
    request_body = OrganizationCreateRequest,
    responses((status = 201, description = "Created", body = KeycloakOrganization))
)]
pub async fn create_organization(
    State(state): State<AppState>,
    axum::Extension(token): axum::Extension<String>,
    Json(request): Json<OrganizationCreateRequest>,
) -> AppResult<impl IntoResponse> {
    let keycloak_service = state.keycloak_service;
    tracing::info!(?request, "Received organization create request");

    // For simplicity, this example assumes a fixed admin token.
    // In a real application, you would obtain this token securely.

    match keycloak_service
        .create_organization(
            &token,
            &request.name,
            request.domains,
            request.redirect_url,
            request.enabled,
            request.attributes,
        )
        .await
    {
        Ok(organization) => Ok((StatusCode::CREATED, Json(organization))),
        Err(e) => {
            tracing::error!("Failed to create organization: {}", e);
            Err(AppError::InternalServerError(
                "Failed to create organization".to_string(),
            ))
        }
    }
}

// Get all organizations
/// Get organizations
#[utoipa::path(
    get,
    path = "/admin/organizations",
    tag = "Organization",
    responses((status = 200, description = "Success", body = Vec<KeycloakOrganization>))
)]
pub async fn get_organizations(
    State(state): State<AppState>,
    axum::Extension(token): axum::Extension<String>,
) -> AppResult<impl IntoResponse> {
    let keycloak_service = state.keycloak_service;
    tracing::info!("Received get organizations request");

    match keycloak_service.get_organizations(&token).await {
        Ok(organizations) => Ok((StatusCode::OK, Json(organizations))),
        Err(e) => {
            tracing::error!("Failed to get organizations: {}", e);
            Err(AppError::InternalServerError(
                "Failed to get organizations".to_string(),
            ))
        }
    }
}

// Get a specific organization by ID
/// Get organization by ID
#[utoipa::path(
    get,
    path = "/admin/organizations/{org_id}",
    tag = "Organization",
    params(("org_id" = String, Path, description = "Organization ID")),
    responses((status = 200, description = "Success", body = KeycloakOrganization))
)]
pub async fn get_organization(
    State(state): State<AppState>,
    axum::Extension(token): axum::Extension<String>,
    Path(org_id): Path<String>,
) -> AppResult<impl IntoResponse> {
    let keycloak_service = state.keycloak_service;
    tracing::info!("Received get organization request for id {}", org_id);

    match keycloak_service
        .get_organization(&token, &org_id)
        .await
    {
        Ok(organization) => Ok((StatusCode::OK, Json(organization))),
        Err(e) => {
            tracing::error!("Failed to get organization: {}", e);
            Err(AppError::InternalServerError(
                "Failed to get organization".to_string(),
            ))
        }
    }
}

// Update an organization
/// Update organization
#[utoipa::path(
    put,
    path = "/admin/organizations/{org_id}",
    tag = "Organization",
    params(("org_id" = String, Path, description = "Organization ID")),
    request_body = OrganizationUpdateRequest,
    responses((status = 204, description = "No Content"))
)]
pub async fn update_organization(
    State(state): State<AppState>,
    axum::Extension(token): axum::Extension<String>,
    Path(org_id): Path<String>,
    Json(request): Json<OrganizationUpdateRequest>,
) -> AppResult<impl IntoResponse> {
    let keycloak_service = state.keycloak_service;
    tracing::info!(
        ?request,
        "Received organization update request for id {}", org_id
    );

    match keycloak_service
        .update_organization(
            &token,
            &org_id,
            &request.name,
            request.domains,
            request.attributes,
        )
        .await
    {
        Ok(_) => Ok(StatusCode::NO_CONTENT),
        Err(e) => {
            tracing::error!("Failed to update organization: {}", e);
            Err(AppError::InternalServerError(
                "Failed to update organization".to_string(),
            ))
        }
    }
}

// Delete an organization
/// Delete organization
#[utoipa::path(
    delete,
    path = "/admin/organizations/{org_id}",
    tag = "Organization",
    params(("org_id" = String, Path, description = "Organization ID")),
    responses((status = 204, description = "No Content"))
)]
pub async fn delete_organization(
    State(state): State<AppState>,
    axum::Extension(token): axum::Extension<String>,
    Path(org_id): Path<String>,
) -> AppResult<impl IntoResponse> {
    let keycloak_service = state.keycloak_service;
    tracing::info!("Received delete organization request for id {}", org_id);

    match keycloak_service
        .delete_organization(&token, &org_id)
        .await
    {
        Ok(_) => Ok(StatusCode::NO_CONTENT),
        Err(e) => {
            tracing::error!("Failed to delete organization: {}", e);
            Err(AppError::InternalServerError(
                "Failed to delete organization".to_string(),
            ))
        }
    }
}