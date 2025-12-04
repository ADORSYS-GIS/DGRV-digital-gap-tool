use axum::Router;
use utoipa::OpenApi;
use crate::{entities::reports::ReportFormat, config::Config};
use utoipa_swagger_ui::SwaggerUi;

use crate::api::dto::action_plan::*;
use crate::api::dto::assessment::*;
use crate::api::dto::common::*;
use crate::api::dto::dimension::*;
use crate::api::dto::gap::*;
use crate::api::dto::group::*;
use crate::api::dto::member::*;
use crate::api::dto::recommendation::*;
use crate::api::dto::report::*;
use crate::api::dto::organization::*;
use crate::api::dto::invitation::*;
use crate::api::dto::organization_dimension::*;
use crate::models::keycloak::KeycloakUser;

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::api::handlers::organization::create_organization,
        crate::api::handlers::organization::get_organizations,
        crate::api::handlers::organization::get_organization,
        crate::api::handlers::organization::update_organization,
        crate::api::handlers::organization::delete_organization,
        crate::api::handlers::invitation::invite_user_to_organization,
        crate::api::handlers::organization::get_organization_members,
        crate::api::handlers::organization::assign_dimension_to_organization,
        crate::api::handlers::organization::get_organization_dimensions,
        crate::api::handlers::organization::remove_dimension_from_organization,
        crate::api::handlers::organization::update_organization_dimensions,
        crate::api::handlers::group::create_group,
        crate::api::handlers::group::get_groups_by_organization,
        crate::api::handlers::group::get_group,
        crate::api::handlers::group::get_group_by_path,
        crate::api::handlers::group::update_group,
        crate::api::handlers::group::delete_group,
        crate::api::handlers::assessment::create_assessment,
        crate::api::handlers::assessment::list_assessments,
        crate::api::handlers::assessment::get_assessment,
        crate::api::handlers::assessment::update_assessment,
        crate::api::handlers::assessment::delete_assessment,
        crate::api::handlers::assessment::get_assessment_summary,
        crate::api::handlers::assessment::create_dimension_assessment,
        crate::api::handlers::assessment::update_dimension_assessment,
        crate::api::handlers::assessment::list_assessments_by_organization,
        crate::api::handlers::assessment::list_assessments_by_cooperation,
        crate::api::handlers::assessment::list_submissions_by_organization,
        crate::api::handlers::assessment::list_submissions_by_cooperation,
        crate::api::handlers::assessment::delete_organization_assessment,
        crate::api::handlers::dimension::create_dimension,
        crate::api::handlers::dimension::list_dimensions,
        crate::api::handlers::dimension::get_dimension,
        crate::api::handlers::dimension::update_dimension,
        crate::api::handlers::dimension::delete_dimension,
        crate::api::handlers::dimension::get_dimension_with_states,
        crate::api::handlers::dimension::create_current_state,
        crate::api::handlers::dimension::update_current_state,
        crate::api::handlers::dimension::delete_current_state,
        crate::api::handlers::dimension::create_desired_state,
        crate::api::handlers::dimension::update_desired_state,
        crate::api::handlers::dimension::delete_desired_state,
        crate::api::handlers::report::generate_report,
        crate::api::handlers::report::get_report,
        crate::api::handlers::report::update_report,
        crate::api::handlers::report::delete_report,
        crate::api::handlers::report::get_report_status,
        crate::api::handlers::report::download_report,
        crate::api::handlers::report::list_reports,
        crate::api::handlers::report::list_reports_by_assessment,
        crate::api::handlers::report::download_latest_report_by_assessment,
        crate::api::handlers::action_plan::list_action_plans,
        crate::api::handlers::action_plan::get_action_plan_by_assessment_id,
        // Recommendation endpoints
        crate::api::handlers::recommendation::create_recommendation,
        crate::api::handlers::recommendation::get_recommendation,
        crate::api::handlers::recommendation::update_recommendation,
        crate::api::handlers::recommendation::delete_recommendation,
        crate::api::handlers::recommendation::list_recommendations,
        crate::api::handlers::recommendation::list_recommendations_by_dimension,
        // Gaps
        crate::api::handlers::gap::get_gap,
        crate::api::handlers::gap::list_gaps,
        crate::api::handlers::gap::list_gaps_by_dimension_assessment,
        crate::api::handlers::gap::list_gaps_by_assessment,
        crate::api::handlers::gap::update_gap,
        crate::api::handlers::gap::delete_gap,
        // Admin gap creation
        crate::api::handlers::gap::admin_create_gap,
        crate::api::handlers::user::delete_user,
        crate::api::handlers::user::add_member,
        crate::api::handlers::user::get_group_members,
    ),
    components(
        schemas(
            // Common
            PaginationParams,
            SortOrder,
            EmptyResponse,
            // Include the generic ApiResponse with EmptyResponse as a concrete type
            ApiResponseEmpty,
            // Include the specific response types for the recommendations endpoints
            ApiResponseRecommendationResponse,
            ApiResponsePaginatedRecommendationResponse,
            // Base ApiResponse type (using EmptyResponse as the generic type)
            // This is a workaround since we can't directly expose the generic ApiResponse<T>
            // in the OpenAPI components. All concrete ApiResponse types are already included
            // in the aliases below.
            //
            // The actual ApiResponse type is exposed through the aliases like ApiResponseEmpty,
            // ApiResponseRecommendationResponse, etc.
            // ApiResponse aliases for Action Plans
            ApiResponseActionPlanResponse,
            ApiResponseActionPlanWithItemsResponse,
            ApiResponseActionItemResponse,
            ApiResponsePaginatedActionPlanResponse,
            // ApiResponse aliases for Reports
            ApiResponseReportResponse,
            ApiResponseReportDownloadResponse,
            ApiResponseReportStatusResponse,
            ApiResponsePaginatedReportResponse,
            
            // Report related schemas
            ReportType,
            ReportFormat,
            ReportStatus,
            UpdateReportRequest,
            // ApiResponse aliases for Assessments & Dimensions
            ApiResponseAssessmentResponse,
            ApiResponsePaginatedAssessmentResponse,
            ApiResponseAssessmentSummaryResponse,
            ApiResponseDimensionAssessmentResponse,
            ApiResponseDimensionResponse,
            ApiResponseAssessmentsResponse,
            ApiResponseDimensionAssessmentsResponse,
            ApiResponsePaginatedDimensionResponse,
            ApiResponseCurrentStateResponse,
            ApiResponseDesiredStateResponse,
            ApiResponseDimensionWithStatesResponse,
            // ApiResponse aliases for Gaps
            ApiResponseGapResponse,
            ApiResponsePaginatedGapResponse,
            ApiResponseAdminCreateGapRequest,
            // ApiResponse aliases for Recommendations
            ApiResponseRecommendationResponse,
            ApiResponsePaginatedRecommendationResponse,
            ApiResponseCreateRecommendationRequest,
            ApiResponseUpdateRecommendationRequest,
            // Paginated alias types
            PaginatedActionPlanResponse,
            PaginatedReportResponse,
            PaginatedAssessmentResponse,
            PaginatedGapResponse,
            PaginatedRecommendationResponse,
            // Assessments
            CreateAssessmentRequest,
            UpdateAssessmentRequest,
            AssessmentResponse,
            AssessmentStatus,
            CreateDimensionAssessmentRequest,
            UpdateDimensionAssessmentRequest,
            DimensionAssessmentResponse,
            AssessmentSummaryResponse,
            AssessmentsResponse,
            DimensionAssessmentsResponse,
            // Dimensions
            CreateDimensionRequest,
            UpdateDimensionRequest,
            DimensionResponse,
            CreateCurrentStateRequest,
            UpdateCurrentStateRequest,
            CurrentStateResponse,
            CreateDesiredStateRequest,
            UpdateDesiredStateRequest,
            DesiredStateResponse,
            DimensionWithStatesResponse,
            DimensionListResponse,
            // Reports
            GenerateReportRequest,
            ReportFormat,
            ReportResponse,
            ReportStatus,
            // Recommendations
            CreateRecommendationRequest,
            UpdateRecommendationRequest,
            RecommendationResponse,
            RecommendationPriority,
            ReportDownloadResponse,
            ReportListResponse,
            ReportStatusResponse,
            // Action Plans
            ActionPlanResponse,
            ActionItemResponse,
            // Gaps
            CreateGapRequest,
            UpdateGapRequest,
            GapResponse,
            GapSeverity,
            // Admin create payload
            SeverityRuleDto,
            DescriptionConfig,
            AdminCreateGapRequest,
            // Organizations
            OrganizationDomainRequest,
            OrganizationCreateRequest,
            OrganizationUpdateRequest,
            OrganizationDomain,
            KeycloakOrganization,
            UserInvitationRequest,
            UserInvitationResponse,
            KeycloakUser,
            // Groups
            GroupCreateRequest,
            GroupUpdateRequest,
            KeycloakGroup,
            GetGroupByPathParams,
            AddMemberRequest,
            AssignDimensionRequest,
            OrganisationDimensionResponse,
            UpdateOrganisationDimensionsRequest,
        )
    ),
    tags(
        (name = "Organization", description = "Organization endpoints"),
        (name = "Group", description = "Group management endpoints"),
        (name = "Assessments", description = "Assessment endpoints"),
        (name = "Dimensions", description = "Dimension endpoints"),
        (name = "Reports", description = "Report endpoints"),
        (name = "Action Plans", description = "Action plan endpoints"),
        (name = "Gaps", description = "Gap endpoints"),
        (name = "Admin", description = "Administrative configuration endpoints"),
        (name = "User", description = "User management endpoints")
    )
)]
pub struct ApiDoc;

pub fn docs_routes<S>(config: Config) -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    let mut openapi = ApiDoc::openapi();
    let mut server = utoipa::openapi::Server::new(config.server_url);
    server.description = Some("DGAT Backend Server".to_string());
    openapi.servers = Some(vec![server]);

    let paths = std::mem::take(&mut openapi.paths.paths);

    for (path, item) in paths {
        openapi.paths.paths.insert(path, item);
    }

    Router::new().merge(SwaggerUi::new("/docs").url("/docs/openapi.json", openapi.clone()))
}
