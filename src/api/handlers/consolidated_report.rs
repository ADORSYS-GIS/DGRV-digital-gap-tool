use axum::{extract::State, http::StatusCode, response::Json};
use uuid::Uuid;

use crate::{
    api::dto::consolidated_report::ConsolidatedReport,
    services::consolidated_report::{
        get_dgrv_admin_consolidated_report, get_org_admin_consolidated_report,
    },
    AppState,
};

/// Get consolidated report for DGRV admin
#[utoipa::path(
    get,
    path = "/consolidated-reports/dgrv-admin",
    responses(
        (status = 200, description = "Consolidated report for DGRV admin", body = ConsolidatedReport),
    )
)]
pub async fn dgrv_admin_consolidated_report(
    State(state): State<AppState>,
) -> Result<Json<ConsolidatedReport>, (StatusCode, String)> {
    let report = get_dgrv_admin_consolidated_report(state.db.clone())
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    Ok(Json(report))
}

/// Get consolidated report for an organization admin
#[utoipa::path(
    get,
    path = "/consolidated-reports/org-admin/{organization_id}",
    params(
        ("organization_id" = Uuid, Path, description = "Organization ID")
    ),
    responses(
        (status = 200, description = "Consolidated report for an organization admin", body = ConsolidatedReport),
    )
)]
pub async fn org_admin_consolidated_report(
    State(state): State<AppState>,
    axum::extract::Path(organization_id): axum::extract::Path<Uuid>,
) -> Result<Json<ConsolidatedReport>, (StatusCode, String)> {
    let report = get_org_admin_consolidated_report(state.db.clone(), organization_id)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    Ok(Json(report))
}
