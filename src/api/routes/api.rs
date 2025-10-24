use axum::{
    routing::{get, post, put, delete},
    Router,
};
use sea_orm::DatabaseConnection;

use crate::api::handlers::{
    assessment::*,
    dimension::*,
    report::*,
    action_plan::*,
};

/// Create the main API routes
pub fn create_api_routes() -> Router<DatabaseConnection> {
    Router::new()
        // Assessment routes
        .route("/assessments", post(create_assessment))
        .route("/assessments", get(list_assessments))
        .route("/assessments/:id", get(get_assessment))
        .route("/assessments/:id", put(update_assessment))
        .route("/assessments/:id", delete(delete_assessment))
        .route("/assessments/:id/summary", get(get_assessment_summary))
        .route("/assessments/:id/dimension-assessments", post(create_dimension_assessment))
        .route("/assessments/:assessment_id/dimension-assessments/:dimension_assessment_id", put(update_dimension_assessment))
        
        // Dimension routes
        .route("/dimensions", post(create_dimension))
        .route("/dimensions", get(list_dimensions))
        .route("/dimensions/:id", get(get_dimension))
        .route("/dimensions/:id", put(update_dimension))
        .route("/dimensions/:id", delete(delete_dimension))
        .route("/dimensions/:id/with-states", get(get_dimension_with_states))
        .route("/dimensions/:dimension_id/current-states", post(create_current_state))
        .route("/dimensions/:dimension_id/current-states/:current_state_id", put(update_current_state))
        .route("/dimensions/:dimension_id/current-states/:current_state_id", delete(delete_current_state))
        .route("/dimensions/:dimension_id/desired-states", post(create_desired_state))
        .route("/dimensions/:dimension_id/desired-states/:desired_state_id", put(update_desired_state))
        .route("/dimensions/:dimension_id/desired-states/:desired_state_id", delete(delete_desired_state))
        
        // Report routes
        .route("/reports", post(create_report))
        .route("/reports", get(list_reports))
        .route("/reports/:id", get(get_report))
        .route("/reports/:id", put(update_report))
        .route("/reports/:id", delete(delete_report))
        
        // Action plan routes
        .route("/action-plans", post(create_action_plan))
        .route("/action-plans", get(list_action_plans))
        .route("/action-plans/:id", get(get_action_plan))
        .route("/action-plans/:id", put(update_action_plan))
        .route("/action-plans/:id", delete(delete_action_plan))
        .route("/action-plans/:id/with-items", get(get_action_plan_with_items))
        .route("/action-plans/:action_plan_id/action-items", post(create_action_item))
        .route("/action-plans/:action_plan_id/action-items/:action_item_id", put(update_action_item))
        .route("/action-plans/:action_plan_id/action-items/:action_item_id", delete(delete_action_item))
}