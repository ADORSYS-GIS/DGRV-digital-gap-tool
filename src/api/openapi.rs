use axum::Router;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::api::dto::assessment::*;
use crate::api::dto::common::*;
use crate::api::dto::dimension::*;
use crate::api::dto::report::*;
use crate::api::dto::action_plan::*;

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
    ),
    components(
        schemas(
            ApiResponse<AssessmentResponse>,
            ApiResponse<AssessmentSummaryResponse>,
            ApiResponse<DimensionAssessmentResponse>,
            PaginatedResponse<AssessmentResponse>,
            PaginationParams,
            CreateAssessmentRequest,
            UpdateAssessmentRequest,
            AssessmentResponse,
            AssessmentStatus,
            CreateDimensionAssessmentRequest,
            UpdateDimensionAssessmentRequest,
            DimensionAssessmentResponse,
            AssessmentSummaryResponse,
            // Dimensions
            ApiResponse<DimensionResponse>,
            ApiResponse<PaginatedResponse<DimensionResponse>>,
            ApiResponse<CurrentStateResponse>,
            ApiResponse<DesiredStateResponse>,
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
            ApiResponse<ReportResponse>,
            ApiResponse<ReportDownloadResponse>,
            ApiResponse<PaginatedResponse<ReportResponse>>,
            GenerateReportRequest,
            UpdateReportRequest,
            ReportResponse,
            ReportType,
            ReportStatus,
            ReportDownloadResponse,
            ReportListResponse,
            ReportStatusResponse,
            // Action Plans
            ApiResponse<ActionPlanResponse>,
            ApiResponse<ActionPlanWithItemsResponse>,
            ApiResponse<PaginatedResponse<ActionPlanResponse>>,
            ApiResponse<ActionItemResponse>,
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
            ActionItemListResponse
        )
    ),
    tags(
        (name = "Assessments", description = "Assessment endpoints"),
        (name = "Dimensions", description = "Dimension endpoints"),
        (name = "Reports", description = "Report endpoints"),
        (name = "Action Plans", description = "Action plan endpoints")
    )
)]
pub struct ApiDoc;

pub fn docs_routes<S>() -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    let openapi = ApiDoc::openapi();
    Router::new()
        .merge(SwaggerUi::new("/api/docs").url("/api/docs/openapi.json", openapi.clone()))
}
