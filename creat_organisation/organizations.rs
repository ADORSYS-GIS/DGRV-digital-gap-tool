use axum::{
    extract::{Extension, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};

use crate::common::models::claims::Claims;
use crate::web::routes::AppState;
use crate::web::api::error::ApiError;
use crate::web::api::models::*;

// Helper function to extract token from request extensions
fn get_token_from_extensions(token: &str) -> Result<String, ApiError> {
    Ok(token.to_string())
}

// Create a new organization
/// Create organization
#[utoipa::path(
    post,
    path = "/admin/organizations",
    tag = "Organization",
    request_body = OrganizationCreateRequest,
    responses((status = 201, description = "Created"))
)]
pub async fn create_organization(
    Extension(claims): Extension<Claims>,
    Extension(token): Extension<String>,
    State(app_state): State<AppState>,
    Json(request): Json<OrganizationCreateRequest>,
) -> Result<impl IntoResponse, ApiError> {
    tracing::info!(?request, "Received organization create request");
    let token = get_token_from_extensions(&token)?;

    // Check if user has appropriate permissions
    if !claims.is_application_admin() {
        return Err(ApiError::BadRequest("Insufficient permissions".to_string()));
    }

    // Call Keycloak service with all required arguments
    match app_state.keycloak_service
        .create_organization(
            &token,
            &request.name,
            request.domains.clone(),
            request.redirect_url.clone(),
            request.enabled.clone(),
            request.attributes.clone(),
        )
        .await
    {
        Ok(organization) => Ok((StatusCode::CREATED, Json(organization))),
        Err(e) => {
            tracing::error!("Failed to create organization: {}", e);
            Err(ApiError::InternalServerError("Failed to create organization".to_string()))
        }
    }
}


use axum::extract::Path;

// Get all organizations
/// Get organizations
#[utoipa::path(
    get,
    path = "/admin/organizations",
    tag = "Organization",
    responses((status = 200, description = "Success", body = Vec<KeycloakOrganization>))
)]
pub async fn get_organizations(
    Extension(claims): Extension<Claims>,
    Extension(token): Extension<String>,
    State(app_state): State<AppState>,
) -> Result<impl IntoResponse, ApiError> {
    tracing::info!("Received get organizations request");
    let token = get_token_from_extensions(&token)?;

    if !claims.is_application_admin() {
        return Err(ApiError::BadRequest("Insufficient permissions".to_string()));
    }

    match app_state.keycloak_service.get_organizations(&token).await {
        Ok(organizations) => Ok((StatusCode::OK, Json(organizations))),
        Err(e) => {
            tracing::error!("Failed to get organizations: {}", e);
            Err(ApiError::InternalServerError("Failed to get organizations".to_string()))
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
    Extension(claims): Extension<Claims>,
    Extension(token): Extension<String>,
    State(app_state): State<AppState>,
    Path(org_id): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    tracing::info!("Received get organization request for id {}", org_id);
    let token = get_token_from_extensions(&token)?;

    if !claims.is_application_admin() {
        return Err(ApiError::BadRequest("Insufficient permissions".to_string()));
    }

    match app_state.keycloak_service.get_organization(&token, &org_id).await {
        Ok(organization) => Ok((StatusCode::OK, Json(organization))),
        Err(e) => {
            tracing::error!("Failed to get organization: {}", e);
            Err(ApiError::InternalServerError("Failed to get organization".to_string()))
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
    Extension(claims): Extension<Claims>,
    Extension(token): Extension<String>,
    State(app_state): State<AppState>,
    Path(org_id): Path<String>,
    Json(request): Json<OrganizationUpdateRequest>,
) -> Result<impl IntoResponse, ApiError> {
    tracing::info!(?request, "Received organization update request for id {}", org_id);
    let token = get_token_from_extensions(&token)?;

    if !claims.is_application_admin() {
        return Err(ApiError::BadRequest("Insufficient permissions".to_string()));
    }

    match app_state.keycloak_service
        .update_organization(
            &token,
            &org_id,
            &request.name,
            request.domains.clone(),
            request.attributes.clone(),
        )
        .await
    {
        Ok(_) => Ok(StatusCode::NO_CONTENT),
        Err(e) => {
            tracing::error!("Failed to update organization: {}", e);
            Err(ApiError::InternalServerError("Failed to update organization".to_string()))
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
    Extension(claims): Extension<Claims>,
    Extension(token): Extension<String>,
    State(app_state): State<AppState>,
    Path(org_id): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    tracing::info!("Received delete organization request for id {}", org_id);
    let token = get_token_from_extensions(&token)?;

    if !claims.is_application_admin() {
        return Err(ApiError::BadRequest("Insufficient permissions".to_string()));
    }

    match app_state.keycloak_service.delete_organization(&token, &org_id).await {
        Ok(_) => Ok(StatusCode::NO_CONTENT),
        Err(e) => {
            tracing::error!("Failed to delete organization: {}", e);
            Err(ApiError::InternalServerError("Failed to delete organization".to_string()))
        }
    }
}
