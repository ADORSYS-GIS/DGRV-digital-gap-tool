use crate::error::AppError;
use crate::repositories::{
    action_items::ActionItemsRepository, assessments::AssessmentsRepository,
    current_states::CurrentStatesRepository, desired_states::DesiredStatesRepository,
    dimension_assessments::DimensionAssessmentsRepository, dimensions::DimensionsRepository,
    gaps::GapsRepository, recommendations::RecommendationsRepository,
};
use base64::{engine::general_purpose, Engine as _};
use bytes::Bytes;
use headless_chrome::{Browser, LaunchOptions};
use sea_orm::DatabaseConnection;
use serde::Serialize;
use std::ffi::OsStr;
use tera::{Context, Tera};
use tracing::{error, info, instrument, warn};
use uuid::Uuid;

/// Data structure for a single row in the PDF report
#[derive(Debug, Clone, Serialize)]
pub struct PdfReportRow {
    pub category: String,
    pub gap: String,
    pub gap_class: String, // "high", "medium", or "low" for CSS class
    pub result: String,
    pub recommendations: Vec<String>,
}

/// Chart data structure
#[derive(Debug, Clone, Serialize)]
pub struct ChartData {
    pub labels: Vec<String>,
    pub current_state: Vec<i32>,
    pub desired_state: Vec<i32>,
}

/// Complete data structure for the PDF report
#[derive(Debug, Clone, Serialize)]
pub struct PdfReportData {
    pub assessment_title: String,
    pub rows: Vec<PdfReportRow>,
    pub chart_data: Option<String>, // JSON string for Chart.js
    pub generation_date: String,
}

pub struct PdfGeneratorService;

impl PdfGeneratorService {
    /// Main entry point to generate a PDF report for an assessment
    #[instrument(skip(db), fields(assessment_id = %assessment_id))]
    pub async fn generate_assessment_pdf(
        db: &DatabaseConnection,
        assessment_id: Uuid,
    ) -> Result<Bytes, AppError> {
        info!("Starting PDF generation process for assessment.");

        // Fetch all required data
        info!("Fetching report data from database.");
        let report_data = Self::fetch_report_data(db, assessment_id).await?;
        info!("Successfully fetched report data.");

        // Generate HTML from template
        info!("Rendering HTML template.");
        let html = Self::render_html_template(&report_data)?;
        info!("Successfully rendered HTML template.");

        // Convert HTML to PDF using headless Chrome
        info!("Converting HTML to PDF.");
        let pdf_bytes = Self::html_to_pdf(&html).await?;
        info!("Successfully converted HTML to PDF.");

        Ok(pdf_bytes)
    }

    /// Aggregates all data needed for the PDF report
    #[instrument(skip(db), fields(assessment_id = %assessment_id))]
    async fn fetch_report_data(
        db: &DatabaseConnection,
        assessment_id: Uuid,
    ) -> Result<PdfReportData, AppError> {
        // Get assessment
        let assessment = AssessmentsRepository::find_by_id(db, assessment_id)
            .await?
            .ok_or_else(|| {
                error!("Assessment with ID {} not found.", assessment_id);
                AppError::NotFound("Assessment not found".to_string())
            })?;
        info!(assessment_title = %assessment.document_title, "Found assessment.");

        // Get dimension assessments
        let dimension_assessments =
            DimensionAssessmentsRepository::find_by_assessment_id(db, assessment_id).await?;
        info!(
            count = dimension_assessments.len(),
            "Found dimension assessments."
        );

        let mut rows = Vec::new();
        let mut chart_labels = Vec::new();
        let mut chart_current = Vec::new();
        let mut chart_desired = Vec::new();

        for dim_assessment in dimension_assessments {
            // Get dimension name
            let dimension = DimensionsRepository::find_by_id(db, dim_assessment.dimension_id)
                .await?
                .ok_or_else(|| {
                    error!(dimension_id = %dim_assessment.dimension_id, "Dimension not found.");
                    AppError::NotFound("Dimension not found".to_string())
                })?;

            // Get gap details
            let gap = GapsRepository::find_by_id(db, dim_assessment.gap_id)
                .await?
                .ok_or_else(|| {
                    error!(gap_id = %dim_assessment.gap_id, "Gap not found.");
                    AppError::NotFound("Gap not found".to_string())
                })?;

            // Get action items for this dimension assessment
            let action_items = ActionItemsRepository::find_by_dimension_assessment_id(
                db,
                dim_assessment.dimension_assessment_id,
            )
            .await?;

            // Get recommendations for each action item
            let mut recommendations = Vec::new();
            for action_item in action_items {
                if let Some(recommendation) =
                    RecommendationsRepository::find_by_id(db, action_item.recommendation_id).await?
                {
                    recommendations.push(recommendation.description);
                }
            }

            // Get current and desired state levels for chart
            let current_state_level = if let Some(current_state) =
                CurrentStatesRepository::find_by_id(db, dim_assessment.current_state_id).await?
            {
                current_state.score
            } else {
                0
            };

            let desired_state_level = if let Some(desired_state) =
                DesiredStatesRepository::find_by_id(db, dim_assessment.desired_state_id).await?
            {
                desired_state.score
            } else {
                0
            };

            // Determine gap class for CSS styling
            let gap_severity_str = format!("{:?}", gap.gap_severity).to_uppercase();
            let gap_class = match gap_severity_str.as_str() {
                "HIGH" => "high",
                "MEDIUM" => "medium",
                "LOW" => "low",
                _ => "medium",
            };

            rows.push(PdfReportRow {
                category: dimension.name.clone(),
                gap: gap_severity_str,
                gap_class: gap_class.to_string(),
                result: gap
                    .gap_description
                    .unwrap_or_else(|| "No description".to_string()),
                recommendations,
            });

            // Add to chart data
            chart_labels.push(dimension.name);
            chart_current.push(current_state_level);
            chart_desired.push(desired_state_level);
        }

        // Create chart data JSON
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
            rows,
            chart_data,
            generation_date: chrono::Utc::now().format("%Y-%m-%d %H:%M UTC").to_string(),
        })
    }

    /// Renders the HTML template with the report data
    #[instrument(skip(data))]
    fn render_html_template(data: &PdfReportData) -> Result<String, AppError> {
        let tera = match Tera::new("templates/**/*.html") {
            Ok(t) => t,
            Err(e) => {
                error!(error = %e, "Failed to parse templates.");
                return Err(AppError::InternalServerError(format!(
                    "Template error: {}",
                    e
                )));
            }
        };

        let mut context = Context::new();
        context.insert("assessment_title", &data.assessment_title);
        context.insert("rows", &data.rows);
        context.insert("chart_data", &data.chart_data);
        context.insert("generation_date", &data.generation_date);

        match tera.render("report.html", &context) {
            Ok(html) => Ok(html),
            Err(e) => {
                error!(error = %e, "Failed to render HTML template.");
                Err(AppError::InternalServerError(format!(
                    "Template render error: {}",
                    e
                )))
            }
        }
    }

    /// Converts HTML to PDF using a headless browser
    #[instrument(skip(html))]
    async fn html_to_pdf(html: &str) -> Result<Bytes, AppError> {
        info!("Initializing headless browser for PDF conversion.");
        let browser = Browser::new(LaunchOptions {
            headless: true,
            sandbox: true,
            args: vec![OsStr::new("--no-sandbox"), OsStr::new("--disable-gpu")],
            ..Default::default()
        })
        .map_err(|e| {
            error!(error = %e, "Failed to launch headless browser.");
            AppError::InternalServerError(format!("Failed to launch browser: {}", e))
        })?;
        info!("Browser launched successfully.");

        let tab = browser.new_tab().map_err(|e| {
            error!(error = %e, "Failed to create new browser tab.");
            AppError::InternalServerError(format!("Failed to create new tab: {}", e))
        })?;
        info!("New browser tab created.");

        // Navigate to a data URL to load the HTML content
        let data_url = format!(
            "data:text/html;base64,{}",
            general_purpose::STANDARD.encode(html)
        );
        tab.navigate_to(&data_url).map_err(|e| {
            error!(error = %e, "Failed to navigate to data URL in headless browser.");
            AppError::InternalServerError(format!("Failed to navigate: {}", e))
        })?;
        info!("Navigated to data URL.");

        // Wait for the chart to be rendered before printing
        info!("Waiting for chart image element to be ready.");
        if let Err(e) = tab.wait_for_element("img#chartImage") {
            warn!(error = %e, "Failed to wait for chart image. This might be okay if there is no chart.");
        } else {
            info!("Chart image element found.");
        }

        info!("Printing page to PDF.");
        let pdf_data = tab.print_to_pdf(None).map_err(|e| {
            error!(error = %e, "Failed to print to PDF.");
            AppError::InternalServerError(format!("Failed to print to PDF: {}", e))
        })?;
        info!("PDF data generated successfully.");

        Ok(Bytes::from(pdf_data))
    }
}
