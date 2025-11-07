use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;
use uuid::Uuid;

use crate::api::dto::{
    assessment::*,
    common::{ApiResponse, PaginatedResponse, PaginationParams},
};
use crate::api::handlers::common::{
    extract_pagination, success_response, success_response_with_message,
};
use crate::error::AppError;
use crate::repositories::{
    assessments::AssessmentsRepository, dimension_assessments::DimensionAssessmentsRepository,
};

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
    State(db): State<Arc<DatabaseConnection>>,
    Json(request): Json<CreateAssessmentRequest>,
) -> Result<Json<ApiResponse<AssessmentResponse>>, (StatusCode, Json<serde_json::Value>)> {
    // Convert request to active model
    let active_model = crate::entities::assessments::ActiveModel {
        user_id: sea_orm::Set(request.user_id),
        organization_id: sea_orm::Set(request.organization_id),
        cooperative_id: sea_orm::Set(request.cooperative_id),
        document_title: sea_orm::Set(request.document_title),
        status: sea_orm::Set(crate::entities::assessments::AssessmentStatus::Draft),
        metadata: sea_orm::Set(request.metadata),
        ..Default::default()
    };

    let assessment = AssessmentsRepository::create(db.as_ref(), active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = AssessmentResponse {
        assessment_id: assessment.assessment_id,
        user_id: assessment.user_id,
        organization_id: assessment.organization_id,
        cooperative_id: assessment.cooperative_id,
        document_title: assessment.document_title,
        status: convert_entity_assessment_status_to_dto(assessment.status),
        started_at: assessment.started_at,
        completed_at: assessment.completed_at,
        created_at: assessment.created_at,
        updated_at: assessment.updated_at,
        metadata: assessment.metadata,
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
    State(db): State<Arc<DatabaseConnection>>,
    Path(assessment_id): Path<Uuid>,
) -> Result<Json<ApiResponse<AssessmentResponse>>, (StatusCode, Json<serde_json::Value>)> {
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
        user_id: assessment.user_id,
        organization_id: assessment.organization_id,
        cooperative_id: assessment.cooperative_id,
        document_title: assessment.document_title,
        status: convert_entity_assessment_status_to_dto(assessment.status),
        started_at: assessment.started_at,
        completed_at: assessment.completed_at,
        created_at: assessment.created_at,
        updated_at: assessment.updated_at,
        metadata: assessment.metadata,
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
    State(db): State<Arc<DatabaseConnection>>,
    Path(assessment_id): Path<Uuid>,
) -> Result<Json<ApiResponse<AssessmentSummaryResponse>>, (StatusCode, Json<serde_json::Value>)> {
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
        user_id: assessment.user_id,
        organization_id: assessment.organization_id,
        cooperative_id: assessment.cooperative_id,
        document_title: assessment.document_title,
        status: convert_entity_assessment_status_to_dto(assessment.status),
        started_at: assessment.started_at,
        completed_at: assessment.completed_at,
        created_at: assessment.created_at,
        updated_at: assessment.updated_at,
        metadata: assessment.metadata,
    };

    let dimension_assessments_response: Vec<DimensionAssessmentResponse> = dimension_assessments
        .into_iter()
        .map(|da| DimensionAssessmentResponse {
            dimension_assessment_id: da.dimension_assessment_id,
            assessment_id: da.assessment_id,
            dimension_id: da.dimension_id,
            current_state_id: da.current_state_id,
            desired_state_id: da.desired_state_id,
            current_score: da.current_score,
            desired_score: da.desired_score,
            created_at: da.created_at,
            updated_at: da.updated_at,
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
    State(db): State<Arc<DatabaseConnection>>,
    Query(params): Query<PaginationParams>,
) -> Result<
    Json<ApiResponse<PaginatedResponse<AssessmentResponse>>>,
    (StatusCode, Json<serde_json::Value>),
> {
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    let offset = ((page - 1) * limit) as u64;

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
            user_id: assessment.user_id,
            organization_id: assessment.organization_id,
            cooperative_id: assessment.cooperative_id,
            document_title: assessment.document_title,
            status: convert_entity_assessment_status_to_dto(assessment.status),
            started_at: assessment.started_at,
            completed_at: assessment.completed_at,
            created_at: assessment.created_at,
            updated_at: assessment.updated_at,
            metadata: assessment.metadata,
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
    State(db): State<Arc<DatabaseConnection>>,
    Path(assessment_id): Path<Uuid>,
    Json(request): Json<UpdateAssessmentRequest>,
) -> Result<Json<ApiResponse<AssessmentResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let mut assessment = AssessmentsRepository::find_by_id(db.as_ref(), assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Assessment not found".to_string(),
            ))
        })?;

    // Update fields if provided
    if let Some(document_title) = request.document_title {
        assessment.document_title = document_title;
    }
    if let Some(cooperative_id) = request.cooperative_id {
        assessment.cooperative_id = cooperative_id;
    }
    if let Some(status) = request.status {
        assessment.status = convert_dto_assessment_status_to_entity(status);
    }
    if let Some(started_at) = request.started_at {
        assessment.started_at = Some(started_at);
    }
    if let Some(completed_at) = request.completed_at {
        assessment.completed_at = Some(completed_at);
    }
    if let Some(metadata) = request.metadata {
        assessment.metadata = Some(metadata);
    }

    assessment.updated_at = chrono::Utc::now();

    let active_model: crate::entities::assessments::ActiveModel = assessment.into();
    let updated_assessment =
        AssessmentsRepository::update(db.as_ref(), assessment_id, active_model)
            .await
            .map_err(crate::api::handlers::common::handle_error)?;

    let response = AssessmentResponse {
        assessment_id: updated_assessment.assessment_id,
        user_id: updated_assessment.user_id,
        organization_id: updated_assessment.organization_id,
        cooperative_id: updated_assessment.cooperative_id,
        document_title: updated_assessment.document_title,
        status: convert_entity_assessment_status_to_dto(updated_assessment.status),
        started_at: updated_assessment.started_at,
        completed_at: updated_assessment.completed_at,
        created_at: updated_assessment.created_at,
        updated_at: updated_assessment.updated_at,
        metadata: updated_assessment.metadata,
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
    State(db): State<Arc<DatabaseConnection>>,
    Path(assessment_id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
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
    State(db): State<Arc<DatabaseConnection>>,
    Path(assessment_id): Path<Uuid>,
    Json(request): Json<CreateDimensionAssessmentRequest>,
) -> Result<Json<ApiResponse<DimensionAssessmentResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let active_model = crate::entities::dimension_assessments::ActiveModel {
        assessment_id: sea_orm::Set(assessment_id),
        dimension_id: sea_orm::Set(request.dimension_id),
        current_state_id: sea_orm::Set(request.current_state_id),
        desired_state_id: sea_orm::Set(request.desired_state_id),
        current_score: sea_orm::Set(request.current_score),
        desired_score: sea_orm::Set(request.desired_score),
        ..Default::default()
    };

    let dimension_assessment = DimensionAssessmentsRepository::create(db.as_ref(), active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = DimensionAssessmentResponse {
        dimension_assessment_id: dimension_assessment.dimension_assessment_id,
        assessment_id: dimension_assessment.assessment_id,
        dimension_id: dimension_assessment.dimension_id,
        current_state_id: dimension_assessment.current_state_id,
        desired_state_id: dimension_assessment.desired_state_id,
        current_score: dimension_assessment.current_score,
        desired_score: dimension_assessment.desired_score,
        created_at: dimension_assessment.created_at,
        updated_at: dimension_assessment.updated_at,
    };

    Ok(success_response_with_message(
        response,
        "Dimension assessment created successfully".to_string(),
    ))
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
    State(db): State<Arc<DatabaseConnection>>,
    Path((assessment_id, dimension_assessment_id)): Path<(Uuid, Uuid)>,
    Json(request): Json<UpdateDimensionAssessmentRequest>,
) -> Result<Json<ApiResponse<DimensionAssessmentResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let mut dimension_assessment =
        DimensionAssessmentsRepository::find_by_id(db.as_ref(), dimension_assessment_id)
            .await
            .map_err(crate::api::handlers::common::handle_error)?
            .ok_or_else(|| {
                crate::api::handlers::common::handle_error(AppError::NotFound(
                    "Dimension assessment not found".to_string(),
                ))
            })?;

    // Verify it belongs to the assessment
    if dimension_assessment.assessment_id != assessment_id {
        return Err(crate::api::handlers::common::handle_error(
            AppError::ValidationError(
                "Dimension assessment does not belong to this assessment".to_string(),
            ),
        ));
    }

    // Update fields if provided
    if let Some(current_state_id) = request.current_state_id {
        dimension_assessment.current_state_id = Some(current_state_id);
    }
    if let Some(desired_state_id) = request.desired_state_id {
        dimension_assessment.desired_state_id = Some(desired_state_id);
    }
    if let Some(current_score) = request.current_score {
        dimension_assessment.current_score = Some(current_score);
    }
    if let Some(desired_score) = request.desired_score {
        dimension_assessment.desired_score = Some(desired_score);
    }

    dimension_assessment.updated_at = chrono::Utc::now();

    let active_model: crate::entities::dimension_assessments::ActiveModel =
        dimension_assessment.into();
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
        current_score: updated_dimension_assessment.current_score,
        desired_score: updated_dimension_assessment.desired_score,
        created_at: updated_dimension_assessment.created_at,
        updated_at: updated_dimension_assessment.updated_at,
    };

    Ok(success_response_with_message(
        response,
        "Dimension assessment updated successfully".to_string(),
    ))
}
