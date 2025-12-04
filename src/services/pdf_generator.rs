use crate::error::AppError;
use crate::repositories::{
    action_items::ActionItemsRepository, 
    assessments::AssessmentsRepository,
    dimension_assessments::DimensionAssessmentsRepository,
    dimensions::DimensionsRepository,
    gaps::GapsRepository,
    recommendations::RecommendationsRepository,
};
use bytes::Bytes;
use printpdf::*;
use sea_orm::DatabaseConnection;
use std::io::BufWriter;
use uuid::Uuid;

/// Data structure for a single row in the PDF report
#[derive(Debug, Clone)]
pub struct PdfReportRow {
    pub category: String,
    pub gap: String,
    pub result: String,
    pub recommendations: Vec<String>,
}

/// Complete data structure for the PDF report
#[derive(Debug, Clone)]
pub struct PdfReportData {
    pub assessment_title: String,
    pub rows: Vec<PdfReportRow>,
}

pub struct PdfGeneratorService;

impl PdfGeneratorService {
    /// Main entry point to generate a PDF report for an assessment
    pub async fn generate_assessment_pdf(
        db: &DatabaseConnection,
        assessment_id: Uuid,
    ) -> Result<Bytes, AppError> {
        // Fetch all required data
        let report_data = Self::fetch_report_data(db, assessment_id).await?;
        
        // Generate the PDF document
        let pdf_bytes = Self::create_pdf_document(&report_data)?;
        
        Ok(pdf_bytes)
    }

    /// Aggregates all data needed for the PDF report
    async fn fetch_report_data(
        db: &DatabaseConnection,
        assessment_id: Uuid,
    ) -> Result<PdfReportData, AppError> {
        // Get assessment
        let assessment = AssessmentsRepository::find_by_id(db, assessment_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Assessment not found".to_string()))?;

        // Get dimension assessments
        let dimension_assessments =
            DimensionAssessmentsRepository::find_by_assessment_id(db, assessment_id).await?;

        let mut rows = Vec::new();

        for dim_assessment in dimension_assessments {
            // Get dimension name
            let dimension = DimensionsRepository::find_by_id(db, dim_assessment.dimension_id)
                .await?
                .ok_or_else(|| AppError::NotFound("Dimension not found".to_string()))?;

            // Get gap details
            let gap = GapsRepository::find_by_id(db, dim_assessment.gap_id)
                .await?
                .ok_or_else(|| AppError::NotFound("Gap not found".to_string()))?;

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

            rows.push(PdfReportRow {
                category: dimension.name,
                gap: format!("{:?}", gap.gap_severity).to_uppercase(),
                result: gap.gap_description.unwrap_or_else(|| "No description".to_string()),
                recommendations,
            });
        }

        Ok(PdfReportData {
            assessment_title: assessment.document_title,
            rows,
        })
    }

    /// Creates the PDF document from the report data
    fn create_pdf_document(data: &PdfReportData) -> Result<Bytes, AppError> {
        // Create a new PDF document
        let (doc, page1, layer1) =
            PdfDocument::new(&data.assessment_title, Mm(210.0), Mm(297.0), "Layer 1");
        let current_layer = doc.get_page(page1).get_layer(layer1);

        // Load a built-in font
        let font = doc.add_builtin_font(BuiltinFont::Helvetica)
            .map_err(|e| AppError::InternalServerError(format!("Failed to load font: {}", e)))?;
        let font_bold = doc.add_builtin_font(BuiltinFont::HelveticaBold)
            .map_err(|e| AppError::InternalServerError(format!("Failed to load font: {}", e)))?;

        // Title
        current_layer.use_text(
            &data.assessment_title,
            18.0,
            Mm(20.0),
            Mm(270.0),
            &font_bold,
        );

        // Table header
        let header_y = 250.0;
        current_layer.use_text("Category", 12.0, Mm(20.0), Mm(header_y), &font_bold);
        current_layer.use_text("Gap", 12.0, Mm(70.0), Mm(header_y), &font_bold);
        current_layer.use_text("Result", 12.0, Mm(100.0), Mm(header_y), &font_bold);
        current_layer.use_text("Recommendations", 12.0, Mm(150.0), Mm(header_y), &font_bold);

        // Table rows
        let mut current_y = header_y - 10.0;
        for row in &data.rows {
            // Check if we need a new page
            if current_y < 30.0 {
                // Add new page logic here if needed
                break;
            }

            // Category
            current_layer.use_text(&row.category, 10.0, Mm(20.0), Mm(current_y), &font);

            // Gap
            current_layer.use_text(&row.gap, 10.0, Mm(70.0), Mm(current_y), &font);

            // Result (truncate if too long)
            let result_text = if row.result.len() > 30 {
                format!("{}...", &row.result[..30])
            } else {
                row.result.clone()
            };
            current_layer.use_text(&result_text, 10.0, Mm(100.0), Mm(current_y), &font);

            // Recommendations (join multiple recommendations)
            let recommendations_text = if row.recommendations.is_empty() {
                "No recommendations".to_string()
            } else if row.recommendations.len() == 1 {
                let rec = &row.recommendations[0];
                if rec.len() > 30 {
                    format!("{}...", &rec[..30])
                } else {
                    rec.clone()
                }
            } else {
                format!("{} recommendations", row.recommendations.len())
            };
            current_layer.use_text(&recommendations_text, 10.0, Mm(150.0), Mm(current_y), &font);

            current_y -= 8.0;
        }

        // Save PDF to bytes
        let mut buffer = BufWriter::new(Vec::new());
        doc.save(&mut buffer)
            .map_err(|e| AppError::InternalServerError(format!("Failed to save PDF: {}", e)))?;

        let bytes = buffer.into_inner()
            .map_err(|e| AppError::InternalServerError(format!("Failed to get PDF bytes: {}", e)))?;

        Ok(Bytes::from(bytes))
    }
}
