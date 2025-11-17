use crate::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::api::dto::{
    common::{ApiResponse, PaginatedResponse, PaginationParams},
    dimension::*,
};
use crate::api::handlers::common::{
    extract_pagination, success_response, success_response_with_message,
};
use crate::error::AppError;
use crate::repositories::{
    current_states::CurrentStatesRepository, desired_states::DesiredStatesRepository,
    dimensions::DimensionsRepository,
};

/// Create a new dimension
#[utoipa::path(
    post,
    path = "/dimensions",
    request_body = CreateDimensionRequest,
    responses(
        (status = 200, description = "Dimension created", body = ApiResponseDimensionResponse)
    )
)]
pub async fn create_dimension(
    State(state): State<AppState>,
    Json(request): Json<CreateDimensionRequest>,
) -> Result<Json<ApiResponse<DimensionResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let active_model = crate::entities::dimensions::ActiveModel {
        dimension_id: sea_orm::Set(Uuid::new_v4()),
        name: sea_orm::Set(request.name),
        description: sea_orm::Set(request.description),
        weight: sea_orm::Set(Some(request.weight.unwrap_or(1))),
        category: sea_orm::Set(request.category),
        is_active: sea_orm::Set(Some(request.is_active.unwrap_or(true))),
        ..Default::default()
    };

    let dimension = DimensionsRepository::create(db.as_ref(), active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = DimensionResponse {
        dimension_id: dimension.dimension_id,
        name: dimension.name,
        description: dimension.description,
        weight: dimension.weight,
        category: dimension.category,
        is_active: dimension.is_active,
        created_at: DateTime::from_naive_utc_and_offset(dimension.created_at, Utc),
        updated_at: DateTime::from_naive_utc_and_offset(dimension.updated_at, Utc),
    };

    Ok(success_response_with_message(
        response,
        "Dimension created successfully".to_string(),
    ))
}

/// Get dimension by ID
#[utoipa::path(
    get,
    path = "/dimensions/{id}",
    params(("id" = Uuid, Path, description = "Dimension ID")),
    responses(
        (status = 200, description = "Dimension fetched", body = ApiResponseDimensionResponse),
        (status = 404, description = "Dimension not found")
    )
)]
pub async fn get_dimension(
    State(state): State<AppState>,
    Path(dimension_id): Path<Uuid>,
) -> Result<Json<ApiResponse<DimensionResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let dimension = DimensionsRepository::find_by_id(db.as_ref(), dimension_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Dimension not found".to_string(),
            ))
        })?;

    let response = DimensionResponse {
        dimension_id: dimension.dimension_id,
        name: dimension.name,
        description: dimension.description,
        weight: dimension.weight,
        category: dimension.category,
        is_active: dimension.is_active,
        created_at: DateTime::from_naive_utc_and_offset(dimension.created_at, Utc),
        updated_at: DateTime::from_naive_utc_and_offset(dimension.updated_at, Utc),
    };

    Ok(success_response(response))
}

/// Get dimension with states
#[utoipa::path(
    get,
    path = "/dimensions/{id}/with-states",
    params(("id" = Uuid, Path, description = "Dimension ID")),
    responses(
        (status = 200, description = "Dimension with states", body = ApiResponseDimensionWithStatesResponse),
        (status = 404, description = "Dimension not found")
    )
)]
pub async fn get_dimension_with_states(
    State(state): State<AppState>,
    Path(dimension_id): Path<Uuid>,
) -> Result<Json<ApiResponse<DimensionWithStatesResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    // Get dimension
    let dimension = DimensionsRepository::find_by_id(db.as_ref(), dimension_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Dimension not found".to_string(),
            ))
        })?;

    // Get current states
    let current_states = CurrentStatesRepository::find_by_dimension(db.as_ref(), dimension_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    // Get desired states
    let desired_states = DesiredStatesRepository::find_by_dimension(db.as_ref(), dimension_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let dimension_response = DimensionResponse {
        dimension_id: dimension.dimension_id,
        name: dimension.name,
        description: dimension.description,
        weight: dimension.weight,
        category: dimension.category,
        is_active: dimension.is_active,
        created_at: DateTime::from_naive_utc_and_offset(dimension.created_at, Utc),
        updated_at: DateTime::from_naive_utc_and_offset(dimension.updated_at, Utc),
    };

    let current_states_response: Vec<CurrentStateResponse> = current_states
        .into_iter()
        .map(|cs| CurrentStateResponse {
            current_state_id: cs.current_state_id,
            dimension_id: cs.dimension_id,
            description: cs.description,
            score: cs.score,
            created_at: cs.created_at,
            updated_at: cs.updated_at,
        })
        .collect();

    let desired_states_response: Vec<DesiredStateResponse> = desired_states
        .into_iter()
        .map(|ds| DesiredStateResponse {
            desired_state_id: ds.desired_state_id,
            dimension_id: ds.dimension_id,
            description: ds.description,
            score: ds.score,
            created_at: ds.created_at,
            updated_at: ds.updated_at,
        })
        .collect();

    let response = DimensionWithStatesResponse {
        dimension: dimension_response,
        current_states: current_states_response,
        desired_states: desired_states_response,
    };

    Ok(success_response(response))
}

/// List dimensions with pagination
#[utoipa::path(
    get,
    path = "/dimensions",
    params(
        ("page" = Option<u32>, Query, description = "Page number (default 1)"),
        ("limit" = Option<u32>, Query, description = "Page size (default 20)")
    ),
    responses(
        (status = 200, description = "Dimensions list", body = ApiResponsePaginatedDimensionResponse)
    )
)]
pub async fn list_dimensions(
    State(state): State<AppState>,
    Query(params): Query<PaginationParams>,
) -> Result<
    Json<ApiResponse<PaginatedResponse<DimensionResponse>>>,
    (StatusCode, Json<serde_json::Value>),
> {
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    let offset = ((page - 1) * limit) as u64;

    let db = &state.db;
    let dimensions = DimensionsRepository::find_all(db.as_ref())
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let total = dimensions.len() as u64;
    let paginated_dimensions: Vec<DimensionResponse> = dimensions
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .map(|dimension| DimensionResponse {
            dimension_id: dimension.dimension_id,
            name: dimension.name,
            description: dimension.description,
            weight: dimension.weight,
            category: dimension.category,
            is_active: dimension.is_active,
            created_at: DateTime::from_naive_utc_and_offset(dimension.created_at, Utc),
            updated_at: DateTime::from_naive_utc_and_offset(dimension.updated_at, Utc),
            })
            .collect();

    let response = PaginatedResponse::new(paginated_dimensions, total, page, limit);
    Ok(success_response(response))
}

/// Update dimension
#[utoipa::path(
    put,
    path = "/dimensions/{id}",
    params(("id" = Uuid, Path, description = "Dimension ID")),
    request_body = UpdateDimensionRequest,
    responses(
        (status = 200, description = "Dimension updated", body = ApiResponseDimensionResponse),
        (status = 404, description = "Dimension not found")
    )
)]
pub async fn update_dimension(
    State(state): State<AppState>,
    Path(dimension_id): Path<Uuid>,
    Json(request): Json<UpdateDimensionRequest>,
) -> Result<Json<ApiResponse<DimensionResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let _existing = DimensionsRepository::find_by_id(db.as_ref(), dimension_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Dimension not found".to_string(),
            ))
        })?;
    // Build a partial ActiveModel with only provided fields set
    let mut active_model = crate::entities::dimensions::ActiveModel {
        dimension_id: sea_orm::Set(dimension_id),
        ..Default::default()
    };
    if let Some(name) = request.name.clone() {
        active_model.name = sea_orm::Set(name);
    }
    if let Some(description) = request.description.clone() {
        active_model.description = sea_orm::Set(Some(description));
    }
    if let Some(weight) = request.weight.clone() {
        active_model.weight = sea_orm::Set(Some(weight));
    }
    if let Some(category) = request.category.clone() {
        active_model.category = sea_orm::Set(Some(category));
    }
    if let Some(is_active) = request.is_active.clone() {
        active_model.is_active = sea_orm::Set(Some(is_active));
    }

    let updated_dimension = DimensionsRepository::update(db.as_ref(), dimension_id, active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = DimensionResponse {
        dimension_id: updated_dimension.dimension_id,
        name: updated_dimension.name,
        description: updated_dimension.description,
        weight: updated_dimension.weight,
        category: updated_dimension.category,
        is_active: updated_dimension.is_active,
        created_at: DateTime::from_naive_utc_and_offset(updated_dimension.created_at, Utc),
        updated_at: DateTime::from_naive_utc_and_offset(updated_dimension.updated_at, Utc),
    };

    Ok(success_response_with_message(
        response,
        "Dimension updated successfully".to_string(),
    ))
}

/// Delete dimension
#[utoipa::path(
    delete,
    path = "/dimensions/{id}",
    params(("id" = Uuid, Path, description = "Dimension ID")),
    responses(
        (status = 200, description = "Dimension deleted")
    )
)]
pub async fn delete_dimension(
    State(state): State<AppState>,
    Path(dimension_id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    DimensionsRepository::delete(db.as_ref(), dimension_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    Ok(success_response_with_message(
        (),
        "Dimension deleted successfully".to_string(),
    ))
}

/// Create current state
#[utoipa::path(
    post,
    path = "/dimensions/{id}/current-states",
    params(("id" = Uuid, Path, description = "Dimension ID")),
    request_body = CreateCurrentStateRequest,
    responses(
        (status = 200, description = "Current state created", body = ApiResponseCurrentStateResponse),
        (status = 404, description = "Dimension not found")
    )
)]
pub async fn create_current_state(
    State(state): State<AppState>,
    Path(dimension_id): Path<Uuid>,
    Json(request): Json<CreateCurrentStateRequest>,
) -> Result<Json<ApiResponse<CurrentStateResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    // Verify dimension exists
    DimensionsRepository::find_by_id(db.as_ref(), dimension_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Dimension not found".to_string(),
            ))
        })?;

    let active_model = crate::entities::current_states::ActiveModel {
        current_state_id: sea_orm::Set(Uuid::new_v4()),
        dimension_id: sea_orm::Set(dimension_id),
        description: sea_orm::Set(request.description),
        score: sea_orm::Set(request.score),
        ..Default::default()
    };

    let current_state = CurrentStatesRepository::create(db.as_ref(), active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = CurrentStateResponse {
        current_state_id: current_state.current_state_id,
        dimension_id: current_state.dimension_id,
        description: current_state.description,
        score: current_state.score,
        created_at: current_state.created_at,
        updated_at: current_state.updated_at,
    };

    Ok(success_response_with_message(
        response,
        "Current state created successfully".to_string(),
    ))
}

/// Update current state
#[utoipa::path(
    put,
    path = "/dimensions/{dimension_id}/current-states/{current_state_id}",
    params(
        ("dimension_id" = Uuid, Path, description = "Dimension ID"),
        ("current_state_id" = Uuid, Path, description = "Current state ID")
    ),
    request_body = UpdateCurrentStateRequest,
    responses(
        (status = 200, description = "Current state updated", body = ApiResponseCurrentStateResponse),
        (status = 404, description = "Current state not found")
    )
)]
pub async fn update_current_state(
    State(state): State<AppState>,
    Path((dimension_id, current_state_id)): Path<(Uuid, Uuid)>,
    Json(request): Json<UpdateCurrentStateRequest>,
) -> Result<Json<ApiResponse<CurrentStateResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let mut current_state = CurrentStatesRepository::find_by_id(db.as_ref(), current_state_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Current state not found".to_string(),
            ))
        })?;

    // Verify it belongs to the dimension
    if current_state.dimension_id != dimension_id {
        return Err(crate::api::handlers::common::handle_error(
            AppError::ValidationError(
                "Current state does not belong to this dimension".to_string(),
            ),
        ));
    }

    // Update fields if provided
    if let Some(description) = request.description {
        current_state.description = Some(description);
    }
    if let Some(score) = request.score {
        current_state.score = score;
    }

    current_state.updated_at = chrono::Utc::now();

    let active_model: crate::entities::current_states::ActiveModel = current_state.into();
    let updated_current_state =
        CurrentStatesRepository::update(db.as_ref(), current_state_id, active_model)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    let response = CurrentStateResponse {
        current_state_id: updated_current_state.current_state_id,
        dimension_id: updated_current_state.dimension_id,
        description: updated_current_state.description,
        score: updated_current_state.score,
        created_at: updated_current_state.created_at,
        updated_at: updated_current_state.updated_at,
    };

    Ok(success_response_with_message(
        response,
        "Current state updated successfully".to_string(),
    ))
}

/// Create desired state
#[utoipa::path(
    post,
    path = "/dimensions/{id}/desired-states",
    params(("id" = Uuid, Path, description = "Dimension ID")),
    request_body = CreateDesiredStateRequest,
    responses(
        (status = 200, description = "Desired state created", body = ApiResponseDesiredStateResponse),
        (status = 404, description = "Dimension not found")
    )
)]
pub async fn create_desired_state(
    State(state): State<AppState>,
    Path(dimension_id): Path<Uuid>,
    Json(request): Json<CreateDesiredStateRequest>,
) -> Result<Json<ApiResponse<DesiredStateResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    // Verify dimension exists
    DimensionsRepository::find_by_id(db.as_ref(), dimension_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Dimension not found".to_string(),
            ))
        })?;

    let active_model = crate::entities::desired_states::ActiveModel {
        desired_state_id: sea_orm::Set(Uuid::new_v4()),
        dimension_id: sea_orm::Set(dimension_id),
        description: sea_orm::Set(request.description),
        score: sea_orm::Set(request.score),
        ..Default::default()
    };

    let desired_state = DesiredStatesRepository::create(db.as_ref(), active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = DesiredStateResponse {
        desired_state_id: desired_state.desired_state_id,
        dimension_id: desired_state.dimension_id,
        description: desired_state.description,
        score: desired_state.score,
        created_at: desired_state.created_at,
        updated_at: desired_state.updated_at,
    };

    Ok(success_response_with_message(
        response,
        "Desired state created successfully".to_string(),
    ))
}

/// Update desired state
#[utoipa::path(
    put,
    path = "/dimensions/{dimension_id}/desired-states/{desired_state_id}",
    params(
        ("dimension_id" = Uuid, Path, description = "Dimension ID"),
        ("desired_state_id" = Uuid, Path, description = "Desired state ID")
    ),
    request_body = UpdateDesiredStateRequest,
    responses(
        (status = 200, description = "Desired state updated", body = ApiResponseDesiredStateResponse),
        (status = 404, description = "Desired state not found")
    )
)]
pub async fn update_desired_state(
    State(state): State<AppState>,
    Path((dimension_id, desired_state_id)): Path<(Uuid, Uuid)>,
    Json(request): Json<UpdateDesiredStateRequest>,
) -> Result<Json<ApiResponse<DesiredStateResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let mut desired_state = DesiredStatesRepository::find_by_id(db.as_ref(), desired_state_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Desired state not found".to_string(),
            ))
        })?;

    // Verify it belongs to the dimension
    if desired_state.dimension_id != dimension_id {
        return Err(crate::api::handlers::common::handle_error(
            AppError::ValidationError(
                "Desired state does not belong to this dimension".to_string(),
            ),
        ));
    }

    // Update fields if provided
    if let Some(description) = request.description {
        desired_state.description = Some(description);
    }
    if let Some(score) = request.score {
        desired_state.score = score;
    }

    desired_state.updated_at = chrono::Utc::now();

    let active_model: crate::entities::desired_states::ActiveModel = desired_state.into();
    let updated_desired_state =
        DesiredStatesRepository::update(db.as_ref(), desired_state_id, active_model)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    let response = DesiredStateResponse {
        desired_state_id: updated_desired_state.desired_state_id,
        dimension_id: updated_desired_state.dimension_id,
        description: updated_desired_state.description,
        score: updated_desired_state.score,
        created_at: updated_desired_state.created_at,
        updated_at: updated_desired_state.updated_at,
    };

    Ok(success_response_with_message(
        response,
        "Desired state updated successfully".to_string(),
    ))
}

/// Delete current state
#[utoipa::path(
    delete,
    path = "/dimensions/{dimension_id}/current-states/{current_state_id}",
    params(
        ("dimension_id" = Uuid, Path, description = "Dimension ID"),
        ("current_state_id" = Uuid, Path, description = "Current state ID")
    ),
    responses(
        (status = 200, description = "Current state deleted")
    )
)]
pub async fn delete_current_state(
    State(state): State<AppState>,
    Path((dimension_id, current_state_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    // Verify current state exists and belongs to dimension
    let current_state = CurrentStatesRepository::find_by_id(db.as_ref(), current_state_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Current state not found".to_string(),
            ))
        })?;

    if current_state.dimension_id != dimension_id {
        return Err(crate::api::handlers::common::handle_error(
            AppError::ValidationError(
                "Current state does not belong to this dimension".to_string(),
            ),
        ));
    }

    CurrentStatesRepository::delete(db.as_ref(), current_state_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    Ok(success_response_with_message(
        (),
        "Current state deleted successfully".to_string(),
    ))
}

/// Delete desired state
#[utoipa::path(
    delete,
    path = "/dimensions/{dimension_id}/desired-states/{desired_state_id}",
    params(
        ("dimension_id" = Uuid, Path, description = "Dimension ID"),
        ("desired_state_id" = Uuid, Path, description = "Desired state ID")
    ),
    responses(
        (status = 200, description = "Desired state deleted")
    )
)]
pub async fn delete_desired_state(
    State(state): State<AppState>,
    Path((dimension_id, desired_state_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    // Verify desired state exists and belongs to dimension
    let desired_state = DesiredStatesRepository::find_by_id(db.as_ref(), desired_state_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Desired state not found".to_string(),
            ))
        })?;

    if desired_state.dimension_id != dimension_id {
        return Err(crate::api::handlers::common::handle_error(
            AppError::ValidationError(
                "Desired state does not belong to this dimension".to_string(),
            ),
        ));
    }

    DesiredStatesRepository::delete(db.as_ref(), desired_state_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    Ok(success_response_with_message(
        (),
        "Desired state deleted successfully".to_string(),
    ))
}
