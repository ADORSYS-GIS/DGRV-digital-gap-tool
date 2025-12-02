use crate::{
    api::dto::group::{GetGroupByPathParams, GroupCreateRequest, GroupUpdateRequest},
    error::{AppError, AppResult},
    AppState,
};
use axum::{
    extract::{Path, State, Query},
    http::StatusCode,
    response::IntoResponse,
    Json,
};

// Create a new group for an organization
#[utoipa::path(
    post,
    path = "/admin/organizations/{org_id}/groups",
    tag = "Group",
    params(("org_id" = String, Path, description = "Organization ID")),
    request_body = GroupCreateRequest,
    responses((status = 201, description = "Created", body = KeycloakGroup))
)]
pub async fn create_group(
    State(state): State<AppState>,
    axum::Extension(token): axum::Extension<String>,
    Path(org_id): Path<String>,
    Json(request): Json<GroupCreateRequest>,
) -> AppResult<impl IntoResponse> {
    let keycloak_service = state.keycloak_service;
    let group_name = format!("{}-{}", org_id, request.name);
    tracing::info!(?request, "Received group create request for organization {}", org_id);

    match keycloak_service
        .create_group(&token, &group_name, request.description)
        .await
    {
        Ok(group) => Ok((StatusCode::CREATED, Json(group))),
        Err(e) => {
            tracing::error!("Failed to create group: {}", e);
            Err(AppError::InternalServerError(
                "Failed to create group".to_string(),
            ))
        }
    }
}

// Get all groups for an organization
#[utoipa::path(
    get,
    path = "/admin/organizations/{org_id}/groups",
    tag = "Group",
    params(("org_id" = String, Path, description = "Organization ID")),
    responses((status = 200, description = "Success", body = Vec<KeycloakGroup>))
)]
pub async fn get_groups_by_organization(
    State(state): State<AppState>,
    axum::Extension(token): axum::Extension<String>,
    Path(org_id): Path<String>,
) -> AppResult<impl IntoResponse> {
    let keycloak_service = state.keycloak_service;
    tracing::info!("Received get groups request for organization {}", org_id);
    let search_prefix = format!("{}-", org_id);

    match keycloak_service.get_groups(&token, Some(&search_prefix)).await {
        Ok(groups) => Ok((StatusCode::OK, Json(groups))),
        Err(e) => {
            tracing::error!("Failed to get groups: {}", e);
            Err(AppError::InternalServerError(
                "Failed to get groups".to_string(),
            ))
        }
    }
}

// Get a specific group by ID
#[utoipa::path(
    get,
    path = "/admin/groups/{group_id}",
    tag = "Group",
    params(("group_id" = String, Path, description = "Group ID")),
    responses((status = 200, description = "Success", body = KeycloakGroup))
)]
pub async fn get_group(
    State(state): State<AppState>,
    axum::Extension(token): axum::Extension<String>,
    Path(group_id): Path<String>,
) -> AppResult<impl IntoResponse> {
    let keycloak_service = state.keycloak_service;
    tracing::info!("Received get group request for id {}", group_id);

    match keycloak_service.get_group_by_id(&token, &group_id).await {
        Ok(group) => Ok((StatusCode::OK, Json(group))),
        Err(e) => {
            tracing::error!("Failed to get group: {}", e);
            Err(AppError::InternalServerError(
                "Failed to get group".to_string(),
            ))
        }
    }
}

// Get a specific group by path
#[utoipa::path(
    get,
    path = "/admin/groups/path",
    tag = "Group",
    params(
        ("path" = String, Query, description = "Group Path")
    ),
    responses((status = 200, description = "Success", body = KeycloakGroup))
)]
pub async fn get_group_by_path(
    State(state): State<AppState>,
    axum::Extension(token): axum::Extension<String>,
    Query(params): Query<GetGroupByPathParams>,
) -> AppResult<impl IntoResponse> {
    let keycloak_service = state.keycloak_service;
    tracing::info!("Received get group request for path {}", params.path);

    match keycloak_service.get_group_by_path(&token, &params.path).await {
        Ok(Some(group)) => Ok((StatusCode::OK, Json(group))),
        Ok(None) => Err(AppError::NotFound("Group not found".to_string())),
        Err(e) => {
            tracing::error!("Failed to get group by path: {}", e);
            Err(AppError::InternalServerError(
                "Failed to get group by path".to_string(),
            ))
        }
    }
}

// Update a group
#[utoipa::path(
    put,
    path = "/admin/groups/{group_id}",
    tag = "Group",
    params(("group_id" = String, Path, description = "Group ID")),
    request_body = GroupUpdateRequest,
    responses((status = 204, description = "No Content"))
)]
pub async fn update_group(
    State(state): State<AppState>,
    axum::Extension(token): axum::Extension<String>,
    Path(group_id): Path<String>,
    Json(request): Json<GroupUpdateRequest>,
) -> AppResult<impl IntoResponse> {
    let keycloak_service = state.keycloak_service;
    tracing::info!(?request, "Received group update request for id {}", group_id);

    match keycloak_service
        .update_group(&token, &group_id, &request.name, request.description)
        .await
    {
        Ok(_) => Ok(StatusCode::NO_CONTENT),
        Err(e) => {
            tracing::error!("Failed to update group: {}", e);
            Err(AppError::InternalServerError(
                "Failed to update group".to_string(),
            ))
        }
    }
}

// Delete a group
#[utoipa::path(
    delete,
    path = "/admin/groups/{group_id}",
    tag = "Group",
    params(("group_id" = String, Path, description = "Group ID")),
    responses((status = 204, description = "No Content"))
)]
pub async fn delete_group(
    State(state): State<AppState>,
    axum::Extension(token): axum::Extension<String>,
    Path(group_id): Path<String>,
) -> AppResult<impl IntoResponse> {
    let keycloak_service = state.keycloak_service;
    tracing::info!("Received delete group request for id {}", group_id);

    match keycloak_service.delete_group(&token, &group_id).await {
        Ok(_) => Ok(StatusCode::NO_CONTENT),
        Err(e) => {
            tracing::error!("Failed to delete group: {}", e);
            Err(AppError::InternalServerError(
                "Failed to delete group".to_string(),
            ))
        }
    }
}