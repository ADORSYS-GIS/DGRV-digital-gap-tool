use sea_orm::DatabaseConnection;
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    api::dto::consolidated_report::{ConsolidatedReport, DimensionSummary, RiskLevelDistribution},
    entities::{dimension_assessments, recommendations::RecommendationPriority},
    repositories::{
        consolidated_report::{
            get_all_organization_submissions, get_cooperative_submissions_by_organization,
        },
        dimension_assessments::DimensionAssessmentsRepository,
        dimensions::DimensionsRepository,
        recommendations::RecommendationsRepository,
    },
};

pub async fn get_dgrv_admin_consolidated_report(
    db: Arc<DatabaseConnection>,
) -> Result<ConsolidatedReport, String> {
    let submissions = get_all_organization_submissions(&db)
        .await
        .map_err(|e| e.to_string())?;

    process_submissions(db, submissions).await
}

pub async fn get_org_admin_consolidated_report(
    db: Arc<DatabaseConnection>,
    organization_id: Uuid,
) -> Result<ConsolidatedReport, String> {
    let submissions = get_cooperative_submissions_by_organization(&db, organization_id)
        .await
        .map_err(|e| e.to_string())?;

    process_submissions(db, submissions).await
}

async fn process_submissions(
    db: Arc<DatabaseConnection>,
    submissions: Vec<crate::entities::assessments::Model>,
) -> Result<ConsolidatedReport, String> {
    let mut dimension_assessments_map: HashMap<Uuid, Vec<dimension_assessments::Model>> =
        HashMap::new();
    let mut total_gap_score = 0;
    let mut total_dimension_assessments = 0;

    for submission in &submissions {
        let dimension_assessments =
            DimensionAssessmentsRepository::find_by_assessment_id(&db, submission.assessment_id)
                .await
                .map_err(|e| e.to_string())?;

        for da in dimension_assessments {
            dimension_assessments_map
                .entry(da.dimension_id)
                .or_default()
                .push(da.clone());
            total_gap_score += da.gap_score;
            total_dimension_assessments += 1;
        }
    }

    let mut dimension_summaries = Vec::new();
    let mut total_risk_level = 0.0;

    for (dimension_id, das) in dimension_assessments_map {
        let dimension = DimensionsRepository::find_by_id(&db, dimension_id)
            .await
            .map_err(|e| e.to_string())?
            .ok_or_else(|| "Dimension not found".to_string())?;

        let (average_gap_score, risk_level_distribution, average_risk_level) =
            calculate_dimension_metrics(&das);

        let recommendations = RecommendationsRepository::find_by_dimension(&db, dimension_id)
            .await
            .map_err(|e| e.to_string())?;

        let top_recommendations = recommendations
            .into_iter()
            .filter(|r| r.priority == RecommendationPriority::High)
            .map(|r| r.description)
            .collect();

        dimension_summaries.push(DimensionSummary {
            dimension_name: dimension.name,
            average_risk_level,
            average_gap_score,
            risk_level_distribution,
            top_recommendations,
        });
        total_risk_level += average_risk_level;
    }

    let overall_average_gap_score = if total_dimension_assessments > 0 {
        total_gap_score as f64 / total_dimension_assessments as f64
    } else {
        0.0
    };

    let overall_average_risk_level = if !dimension_summaries.is_empty() {
        total_risk_level / dimension_summaries.len() as f64
    } else {
        0.0
    };

    Ok(ConsolidatedReport {
        total_entities_analyzed: submissions.len() as i64,
        total_submissions: submissions.len() as i64,
        overall_average_risk_level,
        overall_average_gap_score,
        dimension_summaries,
    })
}

fn calculate_dimension_metrics(
    das: &[dimension_assessments::Model],
) -> (f64, RiskLevelDistribution, f64) {
    let total_gap_score: i32 = das.iter().map(|da| da.gap_score).sum();
    let average_gap_score = if !das.is_empty() {
        total_gap_score as f64 / das.len() as f64
    } else {
        0.0
    };

    let mut high_risk_count = 0;
    let mut medium_risk_count = 0;
    let mut low_risk_count = 0;
    let mut total_risk_score = 0;

    for da in das {
        if da.gap_score >= 3 {
            high_risk_count += 1;
            total_risk_score += 3;
        } else if da.gap_score == 2 {
            medium_risk_count += 1;
            total_risk_score += 2;
        } else {
            low_risk_count += 1;
            total_risk_score += 1;
        }
    }

    let total = das.len() as f64;
    let risk_level_distribution = if total > 0.0 {
        RiskLevelDistribution {
            high_risk_percentage: (high_risk_count as f64 / total) * 100.0,
            medium_risk_percentage: (medium_risk_count as f64 / total) * 100.0,
            low_risk_percentage: (low_risk_count as f64 / total) * 100.0,
        }
    } else {
        RiskLevelDistribution {
            high_risk_percentage: 0.0,
            medium_risk_percentage: 0.0,
            low_risk_percentage: 0.0,
        }
    };

    let average_risk_level = if !das.is_empty() {
        total_risk_score as f64 / das.len() as f64
    } else {
        0.0
    };

    (average_gap_score, risk_level_distribution, average_risk_level)
}
