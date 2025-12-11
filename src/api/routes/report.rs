use crate::AppState;
use axum::{
    routing::{get, post},
    Router,
};

use crate::api::handlers::report::{
    delete_report, download_latest_report_by_assessment, download_report, generate_report,
    get_report, get_report_status, list_reports, list_reports_by_assessment, update_report,
};

/// Create report routes
pub fn create_report_routes() -> Router<AppState> {
    Router::new()
        // Report CRUD operations
        .route("/", post(generate_report))
        .route("/", get(list_reports))
        .route("/:id", get(get_report))
        .route("/:id", axum::routing::put(update_report))
        .route("/:id", axum::routing::delete(delete_report))
        .route("/:id/status", get(get_report_status))
        .route("/:id/download", get(download_report))
        .route(
            "/:id/file",
            get(crate::api::handlers::report::serve_report_file),
        )
        // Assessment-specific reports
        .route(
            "/assessment/:assessment_id",
            get(list_reports_by_assessment),
        )
        .route(
            "/assessment/:assessment_id/download",
            get(download_latest_report_by_assessment),
        )
}
