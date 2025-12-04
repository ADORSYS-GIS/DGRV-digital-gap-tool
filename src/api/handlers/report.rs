use crate::entities::reports::ReportFormat;
use crate::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use uuid::Uuid;

use crate::api::dto::report::{ReportStatus, ReportType};
use crate::api::dto::{
    common::{ApiResponse, PaginatedResponse, PaginationParams},
    report::*,
};
use crate::api::handlers::common::{
    extract_pagination, success_response, success_response_with_message,
};
use crate::error::AppError;
use crate::repositories::reports::ReportsRepository;


// Conversion functions for report enums
fn convert_entity_report_type_to_dto(
    entity_type: crate::entities::reports::ReportType,
) -> ReportType {
    match entity_type {
        crate::entities::reports::ReportType::Summary => ReportType::Summary,
        crate::entities::reports::ReportType::Detailed => ReportType::Detailed,
        crate::entities::reports::ReportType::ActionPlan => ReportType::ActionPlan,
    }
}

fn convert_entity_report_format_to_dto(
    entity_format: crate::entities::reports::ReportFormat,
) -> ReportFormat {
    match entity_format {
        crate::entities::reports::ReportFormat::Pdf => ReportFormat::Pdf,
        crate::entities::reports::ReportFormat::Excel => ReportFormat::Excel,
        crate::entities::reports::ReportFormat::Json => ReportFormat::Json,
    }
}

fn convert_entity_report_status_to_dto(
    entity_status: crate::entities::reports::ReportStatus,
) -> ReportStatus {
    match entity_status {
        crate::entities::reports::ReportStatus::Pending => ReportStatus::Pending,
        crate::entities::reports::ReportStatus::Generating => ReportStatus::Generating,
        crate::entities::reports::ReportStatus::Completed => ReportStatus::Completed,
        crate::entities::reports::ReportStatus::Failed => ReportStatus::Failed,
    }
}

fn convert_dto_report_type_to_entity(dto_type: ReportType) -> crate::entities::reports::ReportType {
    match dto_type {
        ReportType::Summary => crate::entities::reports::ReportType::Summary,
        ReportType::Detailed => crate::entities::reports::ReportType::Detailed,
        ReportType::ActionPlan => crate::entities::reports::ReportType::ActionPlan,
    }
}

fn convert_dto_report_format_to_entity(
    dto_format: ReportFormat,
) -> crate::entities::reports::ReportFormat {
    match dto_format {
        ReportFormat::Pdf => crate::entities::reports::ReportFormat::Pdf,
        ReportFormat::Excel => crate::entities::reports::ReportFormat::Excel,
        ReportFormat::Json => crate::entities::reports::ReportFormat::Json,
    }
}

/// Generate a new report
#[utoipa::path(
    post,
    path = "/reports",
    request_body = GenerateReportRequest,
    responses(
        (status = 200, description = "Report generation started", body = ApiResponseReportResponse)
    )
)]
pub async fn generate_report(
    State(state): State<AppState>,
    Json(request): Json<GenerateReportRequest>,
) -> Result<Json<ApiResponse<ReportResponse>>, (StatusCode, Json<serde_json::Value>)> {
    tracing::info!(
        assessment_id = %request.assessment_id,
        report_type = ?request.report_type,
        format = ?request.format,
        "Received request to generate new report"
    );

    let pdf_bytes_result =
        crate::services::pdf_generator::PdfGeneratorService::generate_assessment_pdf(
            &state.db,
            request.assessment_id,
        )
        .await;

    let pdf_bytes = match pdf_bytes_result {
        Ok(bytes) => {
            tracing::info!("PDF bytes generated successfully.");
            bytes
        }
        Err(e) => {
            tracing::error!(error = %e, "Failed to generate PDF bytes");
            return Err(crate::api::handlers::common::handle_error(e));
        }
    };

    let report_result = state
        .report_service
        .generate_and_store_report(
            request.assessment_id,
            convert_dto_report_type_to_entity(request.report_type),
            request.title,
            convert_dto_report_format_to_entity(request.format),
            pdf_bytes,
        )
        .await;

    let report = match report_result {
        Ok(r) => {
            tracing::info!(report_id = %r.report_id, "Report generation and storage successful");
            r
        }
        Err(e) => {
            tracing::error!(error = %e, "Failed to generate and store report");
            return Err(crate::api::handlers::common::handle_error(e));
        }
    };

    let response = ReportResponse {
        report_id: report.report_id,
        assessment_id: report.assessment_id,
        report_type: convert_entity_report_type_to_dto(report.report_type),
        title: report.title,
        format: convert_entity_report_format_to_dto(report.format),
        summary: report.summary,
        report_data: report.report_data,
        file_path: report.file_path,
        status: convert_entity_report_status_to_dto(report.status),
        generated_at: report.generated_at,
        created_at: report.created_at,
        updated_at: report.updated_at,
    };

    Ok(success_response_with_message(
        response,
        "Report generated and stored successfully".to_string(),
    ))
}

/// Get report by ID
#[utoipa::path(
    get,
    path = "/reports/{id}",
    params(("id" = Uuid, Path, description = "Report ID")),
    responses(
        (status = 200, description = "Report fetched", body = ApiResponseReportResponse),
        (status = 404, description = "Report not found")
    )
)]
pub async fn get_report(
    State(state): State<AppState>,
    Path(report_id): Path<Uuid>,
) -> Result<Json<ApiResponse<ReportResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let report = ReportsRepository::find_by_id(&state.db, report_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Report not found".to_string(),
            ))
        })?;

    let response = ReportResponse {
        report_id: report.report_id,
        assessment_id: report.assessment_id,
        report_type: convert_entity_report_type_to_dto(report.report_type),
        title: report.title,
        format: convert_entity_report_format_to_dto(report.format),
        summary: report.summary,
        report_data: report.report_data,
        file_path: report.file_path,
        status: convert_entity_report_status_to_dto(report.status),
        generated_at: report.generated_at,
        created_at: report.created_at,
        updated_at: report.updated_at,
    };

    Ok(success_response(response))
}

/// Get report status
#[utoipa::path(
    get,
    path = "/reports/{id}/status",
    params(("id" = Uuid, Path, description = "Report ID")),
    responses(
        (status = 200, description = "Report status", body = ApiResponseReportStatusResponse),
        (status = 404, description = "Report not found")
    )
)]
pub async fn get_report_status(
    State(state): State<AppState>,
    Path(report_id): Path<Uuid>,
) -> Result<Json<ApiResponse<ReportStatusResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let report = ReportsRepository::find_by_id(&state.db, report_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Report not found".to_string(),
            ))
        })?;

    let status = convert_entity_report_status_to_dto(report.status);
    let progress = match status {
        ReportStatus::Pending => Some(0),
        ReportStatus::Generating => Some(50),
        ReportStatus::Completed => Some(100),
        ReportStatus::Failed => Some(0),
        ReportStatus::Archived => Some(100),
    };

    let response = ReportStatusResponse {
        report_id: report.report_id,
        status: status.clone(),
        progress,
        message: match status.clone() {
            ReportStatus::Pending => Some("Report is queued for generation".to_string()),
            ReportStatus::Generating => Some("Report is being generated".to_string()),
            ReportStatus::Completed => Some("Report generation completed".to_string()),
            ReportStatus::Failed => Some("Report generation failed".to_string()),
            ReportStatus::Archived => Some("Report has been archived".to_string()),
        },
        estimated_completion: match status {
            ReportStatus::Generating => Some(chrono::Utc::now() + chrono::Duration::minutes(5)),
            _ => None,
        },
    };

    Ok(success_response(response))
}

/// Download report file
#[utoipa::path(
    get,
    path = "/reports/{id}/download",
    params(("id" = Uuid, Path, description = "Report ID")),
    responses(
        (status = 200, description = "Report download info", body = ApiResponseReportDownloadResponse),
        (status = 404, description = "Report not found")
    )
)]
pub async fn download_report(
    State(state): State<AppState>,
    Path(report_id): Path<Uuid>,
) -> Result<Json<ApiResponse<ReportDownloadResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let report = ReportsRepository::find_by_id(&state.db, report_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Report not found".to_string(),
            ))
        })?;

    let format = report.format.clone();
    let report_response = ReportResponse {
        report_id: report.report_id,
        assessment_id: report.assessment_id,
        report_type: convert_entity_report_type_to_dto(report.report_type),
        title: report.title,
        format: convert_entity_report_format_to_dto(format.clone()),
        summary: report.summary,
        report_data: report.report_data,
        file_path: report.file_path.clone(),
        status: convert_entity_report_status_to_dto(report.status),
        generated_at: report.generated_at,
        created_at: report.created_at,
        updated_at: report.updated_at,
    };

    // Generate a simple download URL
    let download_url = Some(format!("/api/v1/reports/{}/file", report_id));

    let response = ReportDownloadResponse {
        report: report_response,
        download_url,
        file_size: None, // Would be retrieved from storage service
        content_type: Some(
            match format {
                crate::entities::reports::ReportFormat::Pdf => "application/pdf",
                crate::entities::reports::ReportFormat::Excel => {
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
                crate::entities::reports::ReportFormat::Json => "application/json",
            }
            .to_string(),
        ),
    };

    Ok(success_response(response))
}

/// Serve report file content
#[utoipa::path(
    get,
    path = "/reports/{id}/file",
    params(("id" = Uuid, Path, description = "Report ID")),
    responses(
        (status = 200, description = "Report file content", body = Vec<u8>),
        (status = 404, description = "Report not found")
    )
)]
pub async fn serve_report_file(
    State(state): State<AppState>,
    Path(report_id): Path<Uuid>,
) -> Result<impl axum::response::IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let (report, file_bytes) = state
        .report_service
        .get_report_file(report_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let content_type = match report.format {
        crate::entities::reports::ReportFormat::Pdf => "application/pdf",
        crate::entities::reports::ReportFormat::Excel => {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
        crate::entities::reports::ReportFormat::Json => "application/json",
    };

    let filename = format!(
        "{}.{}",
        report.title.replace(" ", "_"),
        match report.format {
            crate::entities::reports::ReportFormat::Pdf => "pdf",
            crate::entities::reports::ReportFormat::Excel => "xlsx",
            crate::entities::reports::ReportFormat::Json => "json",
        }
    );

    let mut headers = http::HeaderMap::new();
    headers.insert(
        http::header::CONTENT_TYPE,
        http::HeaderValue::from_static(content_type),
    );
    headers.insert(
        http::header::CONTENT_DISPOSITION,
        http::HeaderValue::from_str(&format!("attachment; filename=\"{}\"", filename)).unwrap(),
    );

    Ok((headers, file_bytes))
}

/// List reports with pagination
#[utoipa::path(
    get,
    path = "/reports",
    params(
        ("page" = Option<u32>, Query, description = "Page number (default 1)"),
        ("limit" = Option<u32>, Query, description = "Page size (default 20)")
    ),
    responses(
        (status = 200, description = "Reports list", body = ApiResponsePaginatedReportResponse)
    )
)]
pub async fn list_reports(
    State(state): State<AppState>,
    Query(params): Query<PaginationParams>,
) -> Result<
    Json<ApiResponse<PaginatedResponse<ReportResponse>>>,
    (StatusCode, Json<serde_json::Value>),
> {
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    let offset = ((page - 1) * limit) as u64;

    let reports = ReportsRepository::find_all(&state.db)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let total = reports.len() as u64;
    let paginated_reports: Vec<ReportResponse> = reports
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .map(|report| ReportResponse {
            report_id: report.report_id,
            assessment_id: report.assessment_id,
            report_type: convert_entity_report_type_to_dto(report.report_type),
            title: report.title,
            format: convert_entity_report_format_to_dto(report.format),
            summary: report.summary,
            report_data: report.report_data,
            file_path: report.file_path,
            status: convert_entity_report_status_to_dto(report.status),
            generated_at: report.generated_at,
            created_at: report.created_at,
            updated_at: report.updated_at,
        })
        .collect();

    let response = PaginatedResponse::new(paginated_reports, total, page, limit);
    Ok(success_response(response))
}

/// List reports by assessment
#[utoipa::path(
    get,
    path = "/reports/assessment/{assessment_id}",
    params(("assessment_id" = Uuid, Path, description = "Assessment ID")),
    responses(
        (status = 200, description = "Reports list by assessment", body = ApiResponsePaginatedReportResponse)
    )
)]
pub async fn list_reports_by_assessment(
    State(state): State<AppState>,
    Path(assessment_id): Path<Uuid>,
    Query(params): Query<PaginationParams>,
) -> Result<
    Json<ApiResponse<PaginatedResponse<ReportResponse>>>,
    (StatusCode, Json<serde_json::Value>),
> {
    let (page, limit, _sort_by, _sort_order) = extract_pagination(Query(params));
    let offset = ((page - 1) * limit) as u64;

    let reports = ReportsRepository::find_by_assessment(&state.db, assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let total = reports.len() as u64;
    let paginated_reports: Vec<ReportResponse> = reports
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .map(|report| ReportResponse {
            report_id: report.report_id,
            assessment_id: report.assessment_id,
            report_type: convert_entity_report_type_to_dto(report.report_type),
            title: report.title,
            format: convert_entity_report_format_to_dto(report.format),
            summary: report.summary,
            report_data: report.report_data,
            file_path: report.file_path,
            status: convert_entity_report_status_to_dto(report.status),
            generated_at: report.generated_at,
            created_at: report.created_at,
            updated_at: report.updated_at,
        })
        .collect();

    let response = PaginatedResponse::new(paginated_reports, total, page, limit);
    Ok(success_response(response))
}

/// Update report
#[utoipa::path(
    put,
    path = "/reports/{id}",
    params(("id" = Uuid, Path, description = "Report ID")),
    request_body = UpdateReportRequest,
    responses(
        (status = 200, description = "Report updated", body = ApiResponseReportResponse),
        (status = 404, description = "Report not found")
    )
)]
pub async fn update_report(
    State(state): State<AppState>,
    Path(report_id): Path<Uuid>,
    Json(request): Json<UpdateReportRequest>,
) -> Result<Json<ApiResponse<ReportResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let mut report = ReportsRepository::find_by_id(&state.db, report_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?
        .ok_or_else(|| {
            crate::api::handlers::common::handle_error(AppError::NotFound(
                "Report not found".to_string(),
            ))
        })?;

    // Update fields if provided
    if let Some(title) = request.title {
        report.title = title;
    }
    if let Some(summary) = request.summary {
        report.summary = Some(summary);
    }
    if let Some(report_data) = request.report_data {
        report.report_data = Some(report_data);
    }

    report.updated_at = chrono::Utc::now();

    let active_model: crate::entities::reports::ActiveModel = report.into();
    let updated_report = ReportsRepository::update(&state.db, report_id, active_model)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let response = ReportResponse {
        report_id: updated_report.report_id,
        assessment_id: updated_report.assessment_id,
        report_type: convert_entity_report_type_to_dto(updated_report.report_type),
        title: updated_report.title,
        format: convert_entity_report_format_to_dto(updated_report.format),
        summary: updated_report.summary,
        report_data: updated_report.report_data,
        file_path: updated_report.file_path,
        status: convert_entity_report_status_to_dto(updated_report.status),
        generated_at: updated_report.generated_at,
        created_at: updated_report.created_at,
        updated_at: updated_report.updated_at,
    };

    Ok(success_response_with_message(
        response,
        "Report updated successfully".to_string(),
    ))
}

/// Delete report
#[utoipa::path(
    delete,
    path = "/reports/{id}",
    params(("id" = Uuid, Path, description = "Report ID")),
    responses(
        (status = 200, description = "Report deleted")
    )
)]
pub async fn delete_report(
    State(state): State<AppState>,
    Path(report_id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, (StatusCode, Json<serde_json::Value>)> {
    ReportsRepository::delete(&state.db, report_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    Ok(success_response_with_message(
        (),
        "Report deleted successfully".to_string(),
    ))
}

/// Download latest PDF report by assessment ID
#[utoipa::path(
    get,
    path = "/reports/assessment/{assessment_id}/download",
    params(("assessment_id" = Uuid, Path, description = "Assessment ID")),
    responses(
        (status = 200, description = "Report file content", body = Vec<u8>),
        (status = 404, description = "Report not found")
    )
)]
pub async fn download_latest_report_by_assessment(
    State(state): State<AppState>,
    Path(assessment_id): Path<Uuid>,
) -> Result<impl axum::response::IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    tracing::info!(assessment_id = %assessment_id, "Request to download latest report");

    // Use the optimized repository method to find the latest completed PDF report
    let report_option = ReportsRepository::find_latest_pdf_by_assessment(&state.db, assessment_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    let report = match report_option {
        Some(r) => {
            tracing::info!(report_id = %r.report_id, "Latest report found");
            r
        }
        None => {
            // Fallback: Check if ANY reports exist for this assessment to provide better logging
            let all_reports = ReportsRepository::find_by_assessment(&state.db, assessment_id)
                .await
                .unwrap_or_default();
            
            tracing::warn!(
                assessment_id = %assessment_id, 
                total_reports_found = %all_reports.len(),
                "No completed PDF reports found for this assessment"
            );
            
            return Err(crate::api::handlers::common::handle_error(
                AppError::NotFound("No completed PDF reports found for this assessment.".to_string()),
            ));
        }
    };

    tracing::info!(report_id = %report.report_id, "Fetching report file");
    let (_report, file_bytes) = state
        .report_service
        .get_report_file(report.report_id)
        .await
        .map_err(crate::api::handlers::common::handle_error)?;

    tracing::info!(
        report_id = %report.report_id,
        file_size_bytes = %file_bytes.len(),
        "Sending PDF file to client"
    );

    let content_type = "application/pdf";
    let filename = format!(
        "{}.pdf",
        report.title.replace(" ", "_")
    );

    let mut headers = http::HeaderMap::new();
    headers.insert(
        http::header::CONTENT_TYPE,
        http::HeaderValue::from_static(content_type),
    );
    headers.insert(
        http::header::CONTENT_DISPOSITION,
        http::HeaderValue::from_str(&format!("attachment; filename=\"{}\"", filename)).unwrap(),
    );

    Ok((headers, file_bytes))
}
