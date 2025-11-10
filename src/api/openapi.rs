use axum::Router;
use utoipa::OpenApi;
use crate::entities::reports::ReportFormat;
use utoipa_swagger_ui::SwaggerUi;

use crate::api::dto::action_plan::*;
use crate::api::dto::assessment::*;
use crate::api::dto::common::*;
use crate::api::dto::dimension::*;
use crate::api::dto::gap::*;
use crate::api::dto::report::*;

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::api::handlers::assessment::create_assessment,
        crate::api::handlers::assessment::list_assessments,
        crate::api::handlers::assessment::get_assessment,
        crate::api::handlers::assessment::update_assessment,
        crate::api::handlers::assessment::delete_assessment,
        crate::api::handlers::assessment::get_assessment_summary,
        crate::api::handlers::assessment::create_dimension_assessment,
        crate::api::handlers::assessment::update_dimension_assessment,
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
        crate::api::handlers::action_plan::create_action_plan,
        crate::api::handlers::action_plan::get_action_plan,
        crate::api::handlers::action_plan::get_action_plan_with_items,
        crate::api::handlers::action_plan::list_action_plans,
        crate::api::handlers::action_plan::list_action_plans_by_assessment,
        crate::api::handlers::action_plan::update_action_plan,
        crate::api::handlers::action_plan::delete_action_plan,
        crate::api::handlers::action_plan::create_action_item,
        crate::api::handlers::action_plan::get_action_item,
        crate::api::handlers::action_plan::update_action_item,
        crate::api::handlers::action_plan::delete_action_item,
        // Gaps
        crate::api::handlers::gap::create_gap,
        crate::api::handlers::gap::get_gap,
        crate::api::handlers::gap::list_gaps,
        crate::api::handlers::gap::list_gaps_by_dimension_assessment,
        crate::api::handlers::gap::list_gaps_by_assessment,
        crate::api::handlers::gap::update_gap,
        crate::api::handlers::gap::delete_gap,
        // Admin config for gaps
        crate::api::handlers::gap::set_severity_rules,
        crate::api::handlers::gap::set_gap_description,
        crate::api::handlers::gap::admin_gap_config,
    ),
    components(
        schemas(
            // Common
            PaginationParams,
            SortOrder,
            EmptyResponse,
            ApiResponseEmpty,
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
            // ApiResponse aliases for Assessments & Dimensions
            ApiResponseAssessmentResponse,
            ApiResponsePaginatedAssessmentResponse,
            ApiResponseAssessmentSummaryResponse,
            ApiResponseDimensionAssessmentResponse,
            ApiResponseDimensionResponse,
            ApiResponsePaginatedDimensionResponse,
            ApiResponseCurrentStateResponse,
            ApiResponseDesiredStateResponse,
            ApiResponseDimensionWithStatesResponse,
            // ApiResponse aliases for Gaps
            ApiResponseGapResponse,
            ApiResponsePaginatedGapResponse,
            // Paginated alias types
            PaginatedActionPlanResponse,
            PaginatedReportResponse,
            PaginatedAssessmentResponse,
            PaginatedGapResponse,
            // Assessments
            CreateAssessmentRequest,
            UpdateAssessmentRequest,
            AssessmentResponse,
            AssessmentStatus,
            CreateDimensionAssessmentRequest,
            UpdateDimensionAssessmentRequest,
            DimensionAssessmentResponse,
            AssessmentSummaryResponse,
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
            UpdateReportRequest,
            ReportResponse,
            ReportType,
            ReportFormat,
            ReportStatus,
            ReportDownloadResponse,
            ReportListResponse,
            ReportStatusResponse,
            // Action Plans
            CreateActionPlanRequest,
            UpdateActionPlanRequest,
            ActionPlanResponse,
            ActionPlanStatus,
            CreateActionItemRequest,
            UpdateActionItemRequest,
            ActionItemResponse,
            ActionItemStatus,
            ActionItemPriority,
            ActionPlanWithItemsResponse,
            ActionPlanListResponse,
            ActionItemListResponse,
            // Gaps
            CreateGapRequest,
            UpdateGapRequest,
            GapResponse,
            GapSeverity,
            // Admin DTOs
            SeverityRuleDto,
            SetSeverityRulesRequest,
            SetGapDescriptionRequest,
            AdminGapConfigRequest
        )
    ),
    tags(
        (name = "Assessments", description = "Assessment endpoints"),
        (name = "Dimensions", description = "Dimension endpoints"),
        (name = "Reports", description = "Report endpoints"),
        (name = "Action Plans", description = "Action plan endpoints"),
        (name = "Gaps", description = "Gap endpoints"),
        (name = "Admin", description = "Administrative configuration endpoints")
    )
)]
pub struct ApiDoc;

pub fn docs_routes<S>() -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    let openapi = ApiDoc::openapi();
    Router::new().merge(SwaggerUi::new("/api/docs").url("/api/docs/openapi.json", openapi.clone()))
}
