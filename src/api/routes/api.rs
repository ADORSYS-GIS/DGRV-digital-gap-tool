use axum::{
    routing::{delete, get, post, put},
    Router,
};
use crate::AppState;

use crate::api::handlers::{
    assessment::*, dimension::*, gap::*, report::*,
};
use crate::api::routes::{
    action_plan::create_action_plan_routes, group::create_group_routes, organization::create_organization_routes, recommendation::create_recommendation_routes, user::user_routes,
};

/// Create the main API routes
pub fn create_api_routes(_app_state: AppState) -> Router<AppState> {
    Router::new()
        .nest("/action-plans", create_action_plan_routes())
        .nest("/admin/organizations", create_organization_routes())
        .nest("/admin/groups", create_group_routes())
        .nest("/admin/users", user_routes())
        .nest("/recommendations", create_recommendation_routes())
        // Assessment routes
        .route("/assessments", post(create_assessment))
        .route("/assessments", get(list_assessments))
        .route("/assessments/:id", get(get_assessment))
        .route("/assessments/:id", put(update_assessment))
        .route("/assessments/:id", delete(delete_assessment))
        .route("/assessments/:id/summary", get(get_assessment_summary))
        .route(
            "/assessments/:id/dimension-assessments",
            post(create_dimension_assessment),
        )
        .route(
            "/assessments/:assessment_id/dimension-assessments/:dimension_assessment_id",
            put(update_dimension_assessment),
        )
        // Dimension routes
        .route("/dimensions", post(create_dimension))
        .route("/dimensions", get(list_dimensions))
        .route("/dimensions/:id", get(get_dimension))
        .route("/dimensions/:id", put(update_dimension))
        .route("/dimensions/:id", delete(delete_dimension))
        .route(
            "/dimensions/:id/with-states",
            get(get_dimension_with_states),
        )
        .route(
            "/dimensions/:dimension_id/current-states",
            post(create_current_state),
        )
        .route(
            "/dimensions/:dimension_id/current-states/:current_state_id",
            put(update_current_state),
        )
        .route(
            "/dimensions/:dimension_id/current-states/:current_state_id",
            delete(delete_current_state),
        )
        .route(
            "/dimensions/:dimension_id/desired-states",
            post(create_desired_state),
        )
        .route(
            "/dimensions/:dimension_id/desired-states/:desired_state_id",
            put(update_desired_state),
        )
        .route(
            "/dimensions/:dimension_id/desired-states/:desired_state_id",
            delete(delete_desired_state),
        )
        // Report routes
        .route("/reports", post(create_report))
        .route("/reports", get(list_reports))
        .route("/reports/:id", get(get_report))
        .route("/reports/:id", put(update_report))
        .route("/reports/:id", delete(delete_report))
        // Gap routes
        .route("/gaps", get(list_gaps))
        .route("/gaps/:id", get(get_gap))
        .route("/gaps/:id", put(update_gap))
        .route("/gaps/:id", delete(delete_gap))
        .route(
            "/dimension-assessments/:dimension_assessment_id/gaps",
            get(list_gaps_by_dimension_assessment),
        )
        .route(
            "/assessments/:assessment_id/gaps",
            get(list_gaps_by_assessment),
        )
        // Admin gap creation
        .route("/admin/gaps", post(admin_create_gap))
}
