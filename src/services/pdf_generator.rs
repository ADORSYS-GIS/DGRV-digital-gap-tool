use crate::error::AppError;
use crate::repositories::{
    action_plans::ActionPlansRepository,
    assessments::AssessmentsRepository,
    current_states::CurrentStatesRepository,
    desired_states::DesiredStatesRepository,
    dimension_assessments::DimensionAssessmentsRepository,
    dimensions::DimensionsRepository,
    gaps::GapsRepository,
};
use base64::{engine::general_purpose, Engine as _};
use bytes::Bytes;
use headless_chrome::{Browser, LaunchOptions};
use sea_orm::DatabaseConnection;
use serde::Serialize;
use std::collections::HashMap;
use std::ffi::OsStr;
use tera::{Context, Tera};
use tracing::{error, info, instrument, warn};
use uuid::Uuid;

/// One row in the report table: one dimension assessment
#[derive(Debug, Clone, Serialize)]
pub struct PdfReportRow {
    pub category: String,
    pub gap: String,
    pub gap_class: String, // "high", "medium", or "low"
    pub result: String,
    /// Action plan items for this dimension (description + status)
    pub recommendations: Vec<String>,
}

/// Chart data
#[derive(Debug, Clone, Serialize)]
pub struct ChartData {
    pub labels: Vec<String>,
    pub current_state: Vec<i32>,
    pub desired_state: Vec<i32>,
}

/// Full report data passed to the template
#[derive(Debug, Clone, Serialize)]
pub struct PdfReportData {
    pub assessment_title: String,
    pub organization_id: String,
    pub rows: Vec<PdfReportRow>,
    pub chart_data: Option<String>,
    pub generation_date: String,
}

pub struct PdfGeneratorService;

impl PdfGeneratorService {
    #[instrument(skip(db), fields(assessment_id = %assessment_id))]
    pub async fn generate_assessment_pdf(
        db: &DatabaseConnection,
        assessment_id: Uuid,
        organization_name: Option<String>,
    ) -> Result<Bytes, AppError> {
        info!("Starting PDF generation.");
        let report_data = Self::fetch_report_data(db, assessment_id, organization_name).await?;
        let html = Self::render_html_template(&report_data)?;
        let pdf_bytes = Self::html_to_pdf(&html).await?;
        Ok(pdf_bytes)
    }

    #[instrument(skip(db), fields(assessment_id = %assessment_id))]
    async fn fetch_report_data(
        db: &DatabaseConnection,
        assessment_id: Uuid,
        organization_name: Option<String>,
    ) -> Result<PdfReportData, AppError> {
        let assessment = AssessmentsRepository::find_by_id(db, assessment_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Assessment not found".to_string()))?;

        let dimension_assessments =
            DimensionAssessmentsRepository::find_by_assessment_id(db, assessment_id).await?;

        // Build a map: dimension_assessment_id -> Vec<action item descriptions>
        // from the action plan for this assessment
        let mut action_items_by_dim_assessment: HashMap<Uuid, Vec<String>> = HashMap::new();
        if let Some(action_plan) =
            ActionPlansRepository::find_action_plan_with_items_by_assessment_id(db, assessment_id)
                .await?
        {
            for item in action_plan.action_items {
                action_items_by_dim_assessment
                    .entry(item.dimension_assessment_id)
                    .or_default()
                    .push(item.description);
            }
        }

        let mut rows = Vec::new();
        let mut chart_labels = Vec::new();
        let mut chart_current = Vec::new();
        let mut chart_desired = Vec::new();

        for dim_assessment in dimension_assessments {
            let dimension =
                DimensionsRepository::find_by_id(db, dim_assessment.dimension_id)
                    .await?
                    .ok_or_else(|| AppError::NotFound("Dimension not found".to_string()))?;

            let gap = GapsRepository::find_by_id(db, dim_assessment.gap_id)
                .await?
                .ok_or_else(|| AppError::NotFound("Gap not found".to_string()))?;

            let current_level =
                if let Some(s) = CurrentStatesRepository::find_by_id(db, dim_assessment.current_state_id).await? {
                    s.score
                } else { 0 };

            let desired_level =
                if let Some(desired_state_id) = dim_assessment.desired_state_id {
                    if let Some(s) = DesiredStatesRepository::find_by_id(db, desired_state_id).await? {
                        s.score
                    } else { 0 }
                } else { 0 };

            let gap_severity_str = format!("{:?}", gap.gap_severity).to_uppercase();
            let gap_class = match gap_severity_str.as_str() {
                "HIGH" => "high",
                "MEDIUM" => "medium",
                _ => "low",
            };

            // Use action plan items as the recommendations for this dimension
            let recommendations = action_items_by_dim_assessment
                .remove(&dim_assessment.dimension_assessment_id)
                .unwrap_or_default();

            rows.push(PdfReportRow {
                category: dimension.name.clone(),
                gap: gap_severity_str,
                gap_class: gap_class.to_string(),
                result: gap.gap_description.unwrap_or_else(|| "No description".to_string()),
                recommendations,
            });

            chart_labels.push(dimension.name);
            chart_current.push(current_level);
            chart_desired.push(desired_level);
        }

        let chart_data = if !chart_labels.is_empty() {
            let chart = ChartData {
                labels: chart_labels,
                current_state: chart_current,
                desired_state: chart_desired,
            };
            Some(serde_json::to_string(&chart).unwrap_or_default())
        } else {
            None
        };

        Ok(PdfReportData {
            assessment_title: assessment.document_title,
            organization_id: organization_name.unwrap_or_else(|| assessment.organization_id.clone()),
            rows,
            chart_data,
            generation_date: chrono::Utc::now().format("%B %d, %Y at %H:%M UTC").to_string(),
        })
    }

    #[instrument(skip(data))]
    fn render_html_template(data: &PdfReportData) -> Result<String, AppError> {
        let tera = Tera::new("templates/**/*.html").map_err(|e| {
            error!(error = %e, "Failed to parse templates.");
            AppError::InternalServerError(format!("Template error: {}", e))
        })?;

        let mut context = Context::new();
        context.insert("assessment_title", &data.assessment_title);
        context.insert("organization_id", &data.organization_id);
        context.insert("rows", &data.rows);
        context.insert("chart_data", &data.chart_data);
        context.insert("generation_date", &data.generation_date);

        tera.render("report.html", &context).map_err(|e| {
            error!(error = %e, "Failed to render HTML template.");
            AppError::InternalServerError(format!("Template render error: {}", e))
        })
    }

    #[instrument(skip(html))]
    async fn html_to_pdf(html: &str) -> Result<Bytes, AppError> {
        let browser = Browser::new(LaunchOptions {
            headless: true,
            sandbox: true,
            args: vec![OsStr::new("--no-sandbox"), OsStr::new("--disable-gpu")],
            ..Default::default()
        })
        .map_err(|e| AppError::InternalServerError(format!("Failed to launch browser: {}", e)))?;

        let tab = browser
            .new_tab()
            .map_err(|e| AppError::InternalServerError(format!("Failed to create tab: {}", e)))?;

        let data_url = format!(
            "data:text/html;base64,{}",
            general_purpose::STANDARD.encode(html)
        );
        tab.navigate_to(&data_url)
            .map_err(|e| AppError::InternalServerError(format!("Failed to navigate: {}", e)))?;

        if let Err(e) = tab.wait_for_element("img#chartImage") {
            warn!(error = %e, "Chart image not found — continuing.");
        }

        let pdf_data = tab
            .print_to_pdf(None)
            .map_err(|e| AppError::InternalServerError(format!("Failed to print to PDF: {}", e)))?;

        Ok(Bytes::from(pdf_data))
    }
}
