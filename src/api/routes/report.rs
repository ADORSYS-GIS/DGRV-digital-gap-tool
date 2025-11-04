use axum::{
    routing::{delete, get, post, put},
    Router,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use crate::api::handlers::report::{
    delete_report, download_report, generate_report, get_report, get_report_status, list_reports,
    list_reports_by_assessment, update_report,
};

/// Create report routes
pub fn create_report_routes() -> Router<Arc<DatabaseConnection>> {
    Router::new()
        // Report CRUD operations
        .route("/", post(generate_report))
        .route("/", get(list_reports))
        .route("/:id", get(get_report))
        .route("/:id", put(update_report))
        .route("/:id", delete(delete_report))
        .route("/:id/status", get(get_report_status))
        .route("/:id/download", get(download_report))
        // Assessment-specific reports
        .route(
            "/assessment/:assessment_id",
            get(list_reports_by_assessment),
        )
}
