use crate::{
    api::dto::{
        assessment::*,
        common::{ApiResponse, PaginatedResponse, PaginationParams},
    },
    api::handlers::common::{
        extract_pagination, success_response, success_response_with_message,
    },
    error::AppError,
    repositories::{
        action_items::ActionItemsRepository, action_plans::ActionPlansRepository,
        assessments::AssessmentsRepository,
        dimension_assessments::DimensionAssessmentsRepository, gaps::GapsRepository,
        recommendations::RecommendationsRepository,
    },
    AppState,
};
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use uuid::Uuid;

// Conversion functions between entity and DTO types
fn convert_entity_assessment_status_to_dto(
    entity_status: crate::entities::assessments::AssessmentStatus,
) -> AssessmentStatus {
    match entity_status {
        crate::entities::assessments::AssessmentStatus::Draft => AssessmentStatus::Draft,
        crate::entities::assessments::AssessmentStatus::InProgress => AssessmentStatus::InProgress,
        crate::entities::assessments::AssessmentStatus::Completed => AssessmentStatus::Completed,
        crate::entities::assessments::AssessmentStatus::Archived => AssessmentStatus::Archived,
    }
}

fn convert_dto_assessment_status_to_entity(
    dto_status: AssessmentStatus,
) -> crate::entities::assessments::AssessmentStatus {
    match dto_status {
        AssessmentStatus::Draft => crate::entities::assessments::AssessmentStatus::Draft,
        AssessmentStatus::InProgress => crate::entities::assessments::AssessmentStatus::InProgress,
        AssessmentStatus::Completed => crate::entities::assessments::AssessmentStatus::Completed,
        AssessmentStatus::Archived => crate::entities::assessments::AssessmentStatus::Archived,
    }
}

#[utoipa::path(
    post,
    path = "/assessments",
    request_body = CreateAssessmentRequest,
    responses(
        (status = 200, description = "Assessment created", body = ApiResponseAssessmentResponse)
    )
)]
/// Create a new assessment
pub async fn create_assessment(
    State(state): State<AppState>,
    Json(request): Json<CreateAssessmentRequest>,
) -> Result<Json<ApiResponse<AssessmentResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    // Convert request to active model
    let active_model = crate::entities::assessments::ActiveModel {
        assessment_id: sea_orm::Set(Uuid::new_v4()),
        organization_id: sea_orm::Set(request.organization_id),
        document_title: sea_orm::Set(request.assessment_name),
        dimensions_id: sea_orm::Set(Some(serde_json::json!(request.dimensions_id))),
        cooperation_id: sea_orm::Set(request.cooperation_id),
        status: sea_orm::Set(crate::entities::assessments::AssessmentStatus::Draft),
        ..Default::default()
    };

    let assessment = AssessmentsRepository::create(db.as_ref(), active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = AssessmentResponse {
        assessment_id: assessment.assessment_id,
        organization_id: assessment.organization_id,
        cooperation_id: assessment.cooperation_id,
        document_title: assessment.document_title,
        status: convert_entity_assessment_status_to_dto(assessment.status),
        started_at: assessment.started_at,
        completed_at: assessment.completed_at,
        created_at: assessment.created_at,
        updated_at: assessment.updated_at,
        dimensions_id: assessment.dimensions_id,
    };

    Ok(success_response_with_message(
        response,
        "Assessment created successfully".to_string(),
    ))
}

#[utoipa::path(
    get,
    path = "/assessments/{id}",
    params(("id" = Uuid, Path, description = "Assessment ID")),
    responses(
        (status = 200, description = "Assessment fetched", body = ApiResponseAssessmentResponse),
        (status = 404, description = "Assessment not found")
    )
)]
/// Get assessment by ID
pub async fn get_assessment(
    State(state): State<AppState>,
    Path(assessment_id): Path<Uuid>,
) -> Result<Json<ApiResponse<AssessmentResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let assessment = AssessmentsRepository::find_by_id(db.as_ref(), assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Assessment not found".to_string(),
            ))
        })?;

    let response = AssessmentResponse {
        assessment_id: assessment.assessment_id,
        organization_id: assessment.organization_id,
        cooperation_id: assessment.cooperation_id,
        document_title: assessment.document_title,
        status: convert_entity_assessment_status_to_dto(assessment.status),
        started_at: assessment.started_at,
        completed_at: assessment.completed_at,
        created_at: assessment.created_at,
        updated_at: assessment.updated_at,
        dimensions_id: assessment.dimensions_id,
    };

    Ok(success_response(response))
}

#[utoipa::path(
    get,
    path = "/assessments/{id}/summary",
    params(("id" = Uuid, Path, description = "Assessment ID")),
    responses(
        (status = 200, description = "Assessment summary", body = ApiResponseAssessmentSummaryResponse),
        (status = 404, description = "Assessment not found")
    )
)]
/// Get assessment summary with related data
pub async fn get_assessment_summary(
    State(state): State<AppState>,
    Path(assessment_id): Path<Uuid>,
) -> Result<Json<ApiResponse<AssessmentSummaryResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    // Get assessment
    let assessment = AssessmentsRepository::find_by_id(db.as_ref(), assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Assessment not found".to_string(),
            ))
        })?;

    // Get dimension assessments
    let dimension_assessments =
        DimensionAssessmentsRepository::find_by_assessment_id(db.as_ref(), assessment_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    // Get gaps count
    let gaps =
        crate::repositories::gaps::GapsRepository::find_by_assessment(db.as_ref(), assessment_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    // Get recommendations count - TODO: Implement when recommendations have assessment_id
    // let recommendations = RecommendationsRepository::find_by_assessment_id(&db, assessment_id)
    //     .await
    //     .map_err(crate::api::handlers::common::handle_error)?;
    let recommendations: Vec<()> = vec![]; // Placeholder

    let assessment_response = AssessmentResponse {
        assessment_id: assessment.assessment_id,
        organization_id: assessment.organization_id,
        cooperation_id: assessment.cooperation_id,
        document_title: assessment.document_title,
        status: convert_entity_assessment_status_to_dto(assessment.status),
        started_at: assessment.started_at,
        completed_at: assessment.completed_at,
        created_at: assessment.created_at,
        updated_at: assessment.updated_at,
        dimensions_id: assessment.dimensions_id,
    };

    let dimension_assessments_response: Vec<DimensionAssessmentResponse> = dimension_assessments
        .into_iter()
        .map(|da| DimensionAssessmentResponse {
            dimension_assessment_id: da.dimension_assessment_id,
            assessment_id: da.assessment_id,
            dimension_id: da.dimension_id,
            created_at: da.created_at,
            updated_at: da.updated_at,
            current_state_id: da.current_state_id,
            desired_state_id: da.desired_state_id,
            gap_score: da.gap_score,
            gap_id: da.gap_id,
            organization_id: da.organization_id,
            cooperation_id: da.cooperation_id,
        })
        .collect();

    let summary = AssessmentSummaryResponse {
        assessment: assessment_response,
        dimension_assessments: dimension_assessments_response,
        gaps_count: gaps.len() as u32,
        recommendations_count: recommendations.len() as u32,
        overall_score: None,
    };

    Ok(success_response(summary))
}

#[utoipa::path(
    get,
    path = "/assessments",
    params(
        ("page" = Option<u32>, Query, description = "Page number (default 1)"),
        ("limit" = Option<u32>, Query, description = "Page size (default 20)")
    ),
    responses(
        (status = 200, description = "Assessments list", body = ApiResponsePaginatedAssessmentResponse)
    )
)]
/// List assessments with pagination
pub async fn list_assessments(
    State(state): State<AppState>,
    Query(params): Query<PaginationParams>,
) -> Result<
    Json<ApiResponse<PaginatedResponse<AssessmentResponse>>>,
    (StatusCode, Json<serde_json::Value>),
> {
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    let offset = ((page - 1) * limit) as u64;

    let db = &state.db;
    let assessments = AssessmentsRepository::find_all(db.as_ref())
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let total = assessments.len() as u64;
    let paginated_assessments: Vec<AssessmentResponse> = assessments
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .map(|assessment| AssessmentResponse {
            assessment_id: assessment.assessment_id,
            organization_id: assessment.organization_id,
            cooperation_id: assessment.cooperation_id,
            document_title: assessment.document_title,
            status: convert_entity_assessment_status_to_dto(assessment.status),
            started_at: assessment.started_at,
            completed_at: assessment.completed_at,
            created_at: assessment.created_at,
            updated_at: assessment.updated_at,
            dimensions_id: assessment.dimensions_id,
        })
        .collect();

    let response = PaginatedResponse::new(paginated_assessments, total, page, limit);
    Ok(success_response(response))
}

#[utoipa::path(
    put,
    path = "/assessments/{id}",
    params(("id" = Uuid, Path, description = "Assessment ID")),
    request_body = UpdateAssessmentRequest,
    responses(
        (status = 200, description = "Assessment updated", body = ApiResponseAssessmentResponse),
        (status = 404, description = "Assessment not found")
    )
)]
/// Update assessment
pub async fn update_assessment(
    State(state): State<AppState>,
    Path(assessment_id): Path<Uuid>,
    Json(request): Json<UpdateAssessmentRequest>,
) -> Result<Json<ApiResponse<AssessmentResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let assessment = AssessmentsRepository::find_by_id(db.as_ref(), assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Assessment not found".to_string(),
            ))
        })?;

    let mut active_model: crate::entities::assessments::ActiveModel = assessment.into();

    // Update fields if provided
    if let Some(assessment_name) = request.assessment_name {
        active_model.document_title = sea_orm::Set(assessment_name);
    }
    if let Some(dimensions_id) = request.dimensions_id {
        active_model.dimensions_id = sea_orm::Set(Some(serde_json::json!(dimensions_id)));
    }
    if let Some(status) = request.status {
        active_model.status = sea_orm::Set(convert_dto_assessment_status_to_entity(status));
    }
    if let Some(started_at) = request.started_at {
        active_model.started_at = sea_orm::Set(Some(started_at));
    }
    if let Some(completed_at) = request.completed_at {
        active_model.completed_at = sea_orm::Set(Some(completed_at));
    }
    let updated_assessment =
        AssessmentsRepository::update(db.as_ref(), assessment_id, active_model)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    let response = AssessmentResponse {
        assessment_id: updated_assessment.assessment_id,
        organization_id: updated_assessment.organization_id,
        cooperation_id: updated_assessment.cooperation_id,
        document_title: updated_assessment.document_title,
        status: convert_entity_assessment_status_to_dto(updated_assessment.status),
        started_at: updated_assessment.started_at,
        completed_at: updated_assessment.completed_at,
        created_at: updated_assessment.created_at,
        updated_at: updated_assessment.updated_at,
        dimensions_id: updated_assessment.dimensions_id,
    };

    Ok(success_response_with_message(
        response,
        "Assessment updated successfully".to_string(),
    ))
}

#[utoipa::path(
    delete,
    path = "/assessments/{id}",
    params(("id" = Uuid, Path, description = "Assessment ID")),
    responses(
        (status = 200, description = "Assessment deleted")
    )
)]
/// Delete assessment
pub async fn delete_assessment(
    State(state): State<AppState>,
    Path(assessment_id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    AssessmentsRepository::delete(db.as_ref(), assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    Ok(success_response_with_message(
        (),
        "Assessment deleted successfully".to_string(),
    ))
}

#[utoipa::path(
    post,
    path = "/assessments/{id}/dimension-assessments",
    params(("id" = Uuid, Path, description = "Assessment ID")),
    request_body = CreateDimensionAssessmentRequest,
    responses(
        (status = 200, description = "Dimension assessment created", body = ApiResponseDimensionAssessmentResponse),
        (status = 404, description = "Assessment not found")
    )
)]
/// Create dimension assessment
pub async fn create_dimension_assessment(
    State(state): State<AppState>,
    Path(assessment_id): Path<Uuid>,
    Json(request): Json<CreateDimensionAssessmentRequest>,
) -> Result<Json<ApiResponse<DimensionAssessmentResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;

    // Validate that the current and desired states exist
    let current_state_exists = crate::repositories::current_states::CurrentStatesRepository::find_by_id(db.as_ref(), request.current_state_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .is_some();
    if !current_state_exists {
        return Err(crate::api::handlers::common::handle_error(AppError::NotFound(
            "Current state not found".to_string(),
        )));
    }

    let desired_state_exists = crate::repositories::desired_states::DesiredStatesRepository::find_by_id(db.as_ref(), request.desired_state_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .is_some();
    if !desired_state_exists {
        return Err(crate::api::handlers::common::handle_error(AppError::NotFound(
            "Desired state not found".to_string(),
        )));
    }

    // Resolve dimension_id from dimension_key if needed
    let mut actual_dimension_id = {
        // Try to find a dimension with this exact dimension_id first
        if crate::repositories::dimensions::DimensionsRepository::find_by_id(db.as_ref(), request.dimension_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?
            .is_some()
        {
            request.dimension_id
        } else {
            // Treat as dimension_key — find the English (base) dimension row
            crate::repositories::dimensions::DimensionsRepository::find_by_key_and_language(
                db.as_ref(),
                request.dimension_id,
                "en",
            )
            .await
            .map_err(crate::api::handlers::common::handle_error)?
            .map(|d| d.dimension_id)
            .unwrap_or(request.dimension_id)
        }
    };

    // Get the dimension_key for this dimension
    let dimension_key = crate::repositories::dimensions::DimensionsRepository::find_by_id(db.as_ref(), actual_dimension_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .map(|d| d.dimension_key)
        .unwrap_or(actual_dimension_id);

    // Check for existing dimension assessment with same dimension_key + assessment_id
    // to prevent duplicates when the same logical dimension is submitted in multiple languages
    let existing_for_key = DimensionAssessmentsRepository::find_by_assessment_id(db.as_ref(), assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    for existing_da in &existing_for_key {
        if let Some(existing_dim) = crate::repositories::dimensions::DimensionsRepository::find_by_id(db.as_ref(), existing_da.dimension_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?
        {
            if existing_dim.dimension_key == dimension_key {
                // Already answered this logical dimension — update instead of creating duplicate
                actual_dimension_id = existing_da.dimension_id;
                // Fall through to update the existing record
                let mut active_model: crate::entities::dimension_assessments::ActiveModel = existing_da.clone().into();
                active_model.current_state_id = sea_orm::Set(Some(request.current_state_id));
                active_model.desired_state_id = sea_orm::Set(Some(request.desired_state_id));
                active_model.gap_score = sea_orm::Set(request.gap_score);

                let updated = DimensionAssessmentsRepository::update(db.as_ref(), existing_da.dimension_assessment_id, active_model)
                    .await
                    .map_err(crate::api::handlers::common::handle_error)?;

                let response = DimensionAssessmentResponse {
                    dimension_assessment_id: updated.dimension_assessment_id,
                    assessment_id: updated.assessment_id,
                    dimension_id: updated.dimension_id,
                    current_state_id: updated.current_state_id,
                    desired_state_id: updated.desired_state_id,
                    gap_score: updated.gap_score,
                    gap_id: updated.gap_id,
                    organization_id: updated.organization_id,
                    cooperation_id: updated.cooperation_id,
                    created_at: updated.created_at,
                    updated_at: updated.updated_at,
                };
                return Ok(success_response_with_message(response, "Dimension assessment updated".to_string()));
            }
        }
    }

    // Look up gap by dimension_key + severity + language (cross-language lookup)
    let gap_severity = match request.gap_score {
        1 => crate::entities::gaps::GapSeverity::Low,
        2 => crate::entities::gaps::GapSeverity::Medium,
        3 => crate::entities::gaps::GapSeverity::High,
        _ => {
            return Err(crate::api::handlers::common::handle_error(
                AppError::ValidationError("Invalid gap_score. Must be 1, 2, or 3.".to_string()),
            ));
        }
    };

    // Get the language from the current_state to know which language the user is answering in
    let user_language = crate::repositories::current_states::CurrentStatesRepository::find_by_id(
        db.as_ref(),
        request.current_state_id,
    )
    .await
    .map_err(crate::api::handlers::common::handle_error)?
    .map(|cs| cs.language)
    .unwrap_or_else(|| "en".to_string());

    let gap = GapsRepository::find_by_dimension_key_and_severity_and_language(
        db.as_ref(),
        dimension_key,
        gap_severity.clone(),
        &user_language,
    )
    .await
    .map_err(crate::api::handlers::common::handle_error)?
    .ok_or_else(|| {
        crate::api::handlers::common::handle_error(AppError::NotFound(
            format!("No gap found for dimension_key {} with severity {:?} in language {}", dimension_key, gap_severity, user_language),
        ))
    })?;

    let dimension_assessment_active_model = crate::entities::dimension_assessments::ActiveModel {
        dimension_assessment_id: sea_orm::Set(Uuid::new_v4()),
        assessment_id: sea_orm::Set(assessment_id),
        dimension_id: sea_orm::Set(actual_dimension_id),
        current_state_id: sea_orm::Set(Some(request.current_state_id)),
        desired_state_id: sea_orm::Set(Some(request.desired_state_id)),
        gap_score: sea_orm::Set(request.gap_score),
        gap_id: sea_orm::Set(gap.gap_id),
        organization_id: sea_orm::Set(request.organization_id),
        cooperation_id: sea_orm::Set(request.cooperation_id),
        ..Default::default()
    };

    let dimension_assessment =
        DimensionAssessmentsRepository::create(db.as_ref(), dimension_assessment_active_model)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    // 2. Find or create an Action Plan
    let action_plan =
        ActionPlansRepository::find_or_create(db.as_ref(), dimension_assessment.assessment_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    // 3. Create an Action Item — look up recommendation by dimension_key + priority + language
    let recommendation_priority = match request.gap_score {
        1 => "Low",
        2 => "Medium",
        3 => "High",
        _ => "Medium",
    };
    if let Some(recommendation) = RecommendationsRepository::find_by_dimension_key_and_priority_and_language(
        db.as_ref(),
        dimension_key,
        recommendation_priority,
        &user_language,
    )
    .await
    .map_err(crate::api::handlers::common::handle_error)?
    {
        let action_item_active_model = crate::entities::action_items::ActiveModel {
            id: sea_orm::Set(Uuid::new_v4()),
            action_plan_id: sea_orm::Set(action_plan.id),
            dimension_assessment_id: sea_orm::Set(dimension_assessment.dimension_assessment_id),
            recommendation_id: sea_orm::Set(recommendation.recommendation_id),
            ..Default::default()
        };

        ActionItemsRepository::create(db.as_ref(), action_item_active_model)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;
    }

    // 4. Prepare and return the response
    let response = DimensionAssessmentResponse {
        dimension_assessment_id: dimension_assessment.dimension_assessment_id,
        assessment_id: dimension_assessment.assessment_id,
        dimension_id: dimension_assessment.dimension_id,
        current_state_id: dimension_assessment.current_state_id,
        desired_state_id: dimension_assessment.desired_state_id,
        gap_score: dimension_assessment.gap_score,
        gap_id: dimension_assessment.gap_id,
        organization_id: dimension_assessment.organization_id,
        cooperation_id: dimension_assessment.cooperation_id,
        created_at: dimension_assessment.created_at,
        updated_at: dimension_assessment.updated_at,
    };

    Ok(success_response_with_message(
        response,
        "Dimension assessment created and action plan generated successfully".to_string(),
    ))
}

#[utoipa::path(
    get,
    path = "/assessments/{assessment_id}/dimension-assessments",
    params(("assessment_id" = Uuid, Path, description = "Assessment ID")),
    responses(
        (status = 200, description = "Dimension assessments list", body = ApiResponseDimensionAssessmentsResponse),
        (status = 404, description = "Assessment not found")
    )
)]
/// List all dimension assessments for an assessment
pub async fn list_dimension_assessments(
    State(state): State<AppState>,
    Path(assessment_id): Path<Uuid>,
) -> Result<Json<ApiResponse<DimensionAssessmentsResponse>>, (StatusCode, Json<serde_json::Value>)>
{
    let db = &state.db;

    // Verify assessment exists
    AssessmentsRepository::find_by_id(db.as_ref(), assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Assessment not found".to_string(),
            ))
        })?;

    // Get all dimension assessments for this assessment
    let dimension_assessments =
        DimensionAssessmentsRepository::find_by_assessment_id(db.as_ref(), assessment_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    let dimension_assessments_list: Vec<DimensionAssessmentResponse> = dimension_assessments
        .into_iter()
        .map(|da| DimensionAssessmentResponse {
            dimension_assessment_id: da.dimension_assessment_id,
            assessment_id: da.assessment_id,
            dimension_id: da.dimension_id,
            current_state_id: da.current_state_id,
            desired_state_id: da.desired_state_id,
            gap_score: da.gap_score,
            gap_id: da.gap_id,
            organization_id: da.organization_id,
            cooperation_id: da.cooperation_id,
            created_at: da.created_at,
            updated_at: da.updated_at,
        })
        .collect();

    let response = DimensionAssessmentsResponse {
        dimension_assessments: dimension_assessments_list,
    };

    Ok(success_response(response))
}

#[utoipa::path(
    put,
    path = "/assessments/{assessment_id}/dimension-assessments/{dimension_assessment_id}",
    params(
        ("assessment_id" = Uuid, Path, description = "Assessment ID"),
        ("dimension_assessment_id" = Uuid, Path, description = "Dimension assessment ID")
    ),
    request_body = UpdateDimensionAssessmentRequest,
    responses(
        (status = 200, description = "Dimension assessment updated", body = ApiResponseDimensionAssessmentResponse),
        (status = 404, description = "Dimension assessment not found")
    )
)]
/// Update dimension assessment
pub async fn update_dimension_assessment(
    State(state): State<AppState>,
    Path((_assessment_id, dimension_assessment_id)): Path<(Uuid, Uuid)>,
    Json(request): Json<UpdateDimensionAssessmentRequest>,
) -> Result<Json<ApiResponse<DimensionAssessmentResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let dimension_assessment =
        DimensionAssessmentsRepository::find_by_id(db.as_ref(), dimension_assessment_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?
            .ok_or_else(|| {
                crate::api::handlers::common::handle_error(AppError::NotFound(
                    "Dimension assessment not found".to_string(),
                ))
            })?;

    let mut active_model: crate::entities::dimension_assessments::ActiveModel =
        dimension_assessment.clone().into();

    if let Some(current_state_id) = request.current_state_id {
        active_model.current_state_id = sea_orm::Set(Some(current_state_id));
    }

    if let Some(desired_state_id) = request.desired_state_id {
        active_model.desired_state_id = sea_orm::Set(Some(desired_state_id));
    }

    // If gap_score is being updated, also update the gap_id
    if let Some(gap_score) = request.gap_score {
        active_model.gap_score = sea_orm::Set(gap_score);

        // Look up the corresponding gap by dimension and severity
        let gap = GapsRepository::find_by_dimension_and_severity(
            db.as_ref(),
            dimension_assessment.dimension_id,
            match gap_score {
                1 => crate::entities::gaps::GapSeverity::Low,
                2 => crate::entities::gaps::GapSeverity::Medium,
                3 => crate::entities::gaps::GapSeverity::High,
                _ => {
                    return Err(crate::api::handlers::common::handle_error(
                        AppError::ValidationError(
                            "Invalid gap_score. Must be 1, 2, or 3.".to_string(),
                        ),
                    ));
                }
            },
        )
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Corresponding gap not found for the given dimension and severity".to_string(),
            ))
        })?;

        active_model.gap_id = sea_orm::Set(gap.gap_id);
    }

    let updated_dimension_assessment =
        DimensionAssessmentsRepository::update(db.as_ref(), dimension_assessment_id, active_model)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    let response = DimensionAssessmentResponse {
        dimension_assessment_id: updated_dimension_assessment.dimension_assessment_id,
        assessment_id: updated_dimension_assessment.assessment_id,
        dimension_id: updated_dimension_assessment.dimension_id,
        current_state_id: updated_dimension_assessment.current_state_id,
        desired_state_id: updated_dimension_assessment.desired_state_id,
        gap_score: updated_dimension_assessment.gap_score,
        gap_id: updated_dimension_assessment.gap_id,
        organization_id: updated_dimension_assessment.organization_id,
        cooperation_id: updated_dimension_assessment.cooperation_id,
        created_at: updated_dimension_assessment.created_at,
        updated_at: updated_dimension_assessment.updated_at,
    };

    Ok(success_response_with_message(
        response,
        "Dimension assessment updated successfully".to_string(),
    ))
}

#[utoipa::path(
    get,
    path = "/assessments/organizations/{organization_id}",
    params(("organization_id" = String, Path, description = "Organization ID")),
    responses(
        (status = 200, description = "Assessments by organization", body = ApiResponseAssessmentsResponse)
    )
)]
/// List assessments by organization
pub async fn list_assessments_by_organization(
    State(state): State<AppState>,
    Path(organization_id): Path<String>,
) -> Result<Json<ApiResponse<AssessmentsResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let assessments = AssessmentsRepository::find_by_organization_id(db.as_ref(), organization_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = AssessmentsResponse {
        assessments: assessments
            .into_iter()
            .map(|assessment| AssessmentResponse {
                assessment_id: assessment.assessment_id,
                organization_id: assessment.organization_id,
                cooperation_id: assessment.cooperation_id,
                document_title: assessment.document_title,
                status: convert_entity_assessment_status_to_dto(assessment.status),
                started_at: assessment.started_at,
                completed_at: assessment.completed_at,
                created_at: assessment.created_at,
                updated_at: assessment.updated_at,
                dimensions_id: assessment.dimensions_id,
            })
            .collect(),
    };

    Ok(success_response(response))
}

#[utoipa::path(
    get,
    path = "/assessments/cooperations/{cooperation_id}",
    params(("cooperation_id" = String, Path, description = "Cooperation ID")),
    responses(
        (status = 200, description = "Assessments by cooperation", body = ApiResponseAssessmentsResponse)
    )
)]
/// List assessments by cooperation
pub async fn list_assessments_by_cooperation(
    State(state): State<AppState>,
    Path(cooperation_id): Path<String>,
) -> Result<Json<ApiResponse<AssessmentsResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let assessments = AssessmentsRepository::find_by_cooperation_id(db.as_ref(), cooperation_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = AssessmentsResponse {
        assessments: assessments
            .into_iter()
            .map(|assessment| AssessmentResponse {
                assessment_id: assessment.assessment_id,
                organization_id: assessment.organization_id,
                cooperation_id: assessment.cooperation_id,
                document_title: assessment.document_title,
                status: convert_entity_assessment_status_to_dto(assessment.status),
                started_at: assessment.started_at,
                completed_at: assessment.completed_at,
                created_at: assessment.created_at,
                updated_at: assessment.updated_at,
                dimensions_id: assessment.dimensions_id,
            })
            .collect(),
    };

    Ok(success_response(response))
}

#[utoipa::path(
    get,
    path = "/assessments/organizations/{organization_id}/submissions",
    params(("organization_id" = String, Path, description = "Organization ID")),
    responses(
        (status = 200, description = "Submissions by organization", body = ApiResponseAssessmentSummaryResponse)
    )
)]
/// List submissions by organization
pub async fn list_submissions_by_organization(
    State(state): State<AppState>,
    Path(organization_id): Path<String>,
) -> Result<Json<ApiResponse<AssessmentsResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let assessments =
        AssessmentsRepository::find_all_completed_by_organization_id(db.as_ref(), organization_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    let response = AssessmentsResponse {
        assessments: assessments
            .into_iter()
            .map(|assessment| AssessmentResponse {
                assessment_id: assessment.assessment_id,
                organization_id: assessment.organization_id,
                cooperation_id: assessment.cooperation_id,
                document_title: assessment.document_title,
                status: convert_entity_assessment_status_to_dto(assessment.status),
                started_at: assessment.started_at,
                completed_at: assessment.completed_at,
                created_at: assessment.created_at,
                updated_at: assessment.updated_at,
                dimensions_id: assessment.dimensions_id,
            })
            .collect(),
    };

    Ok(success_response(response))
}

#[utoipa::path(
    get,
    path = "/assessments/cooperations/{cooperation_id}/submissions",
    params(("cooperation_id" = String, Path, description = "Cooperation ID")),
    responses(
        (status = 200, description = "Submissions by cooperation", body = ApiResponseAssessmentSummaryResponse)
    )
)]
/// List submissions by cooperation
pub async fn list_submissions_by_cooperation(
    State(state): State<AppState>,
    Path(cooperation_id): Path<String>,
) -> Result<Json<ApiResponse<AssessmentsResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let assessments =
        AssessmentsRepository::find_all_completed_by_cooperation_id(db.as_ref(), cooperation_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    let response = AssessmentsResponse {
        assessments: assessments
            .into_iter()
            .map(|assessment| AssessmentResponse {
                assessment_id: assessment.assessment_id,
                organization_id: assessment.organization_id,
                cooperation_id: assessment.cooperation_id,
                document_title: assessment.document_title,
                status: convert_entity_assessment_status_to_dto(assessment.status),
                started_at: assessment.started_at,
                completed_at: assessment.completed_at,
                created_at: assessment.created_at,
                updated_at: assessment.updated_at,
                dimensions_id: assessment.dimensions_id,
            })
            .collect(),
    };

    Ok(success_response(response))
}

#[utoipa::path(
    delete,
    path = "/assessments/organizations/{organization_id}/{assessment_id}",
    params(
        ("organization_id" = String, Path, description = "Organization ID"),
        ("assessment_id" = Uuid, Path, description = "Assessment ID")
    ),
    responses(
        (status = 200, description = "Assessment deleted"),
        (status = 404, description = "Assessment not found")
    )
)]
/// Delete an assessment for a specific organization
pub async fn delete_organization_assessment(
    State(state): State<AppState>,
    Path((organization_id, assessment_id)): Path<(String, Uuid)>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
    let db = &state.db;
    let deleted = AssessmentsRepository::delete_by_organization_and_id(
        db.as_ref(),
        organization_id,
        assessment_id,
    )
    .await
    .map_err(crate::api::handlers::common::handle_error)?;

    if deleted {
        Ok(success_response_with_message(
            (),
            "Assessment deleted successfully".to_string(),
        ))
    } else {
        Err(crate::api::handlers::common::handle_error(
            AppError::NotFound("Assessment not found".to_string()),
        ))
    }
}
