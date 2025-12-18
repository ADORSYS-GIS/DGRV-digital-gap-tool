use axum::{routing::get, Router};

use crate::{api::handlers::consolidated_report::*, AppState};

pub fn consolidated_report_routes() -> Router<AppState> {
    Router::new()
        .route("/dgrv-admin", get(dgrv_admin_consolidated_report))
        .route(
            "/org-admin/:organization_id",
            get(org_admin_consolidated_report),
        )
}
