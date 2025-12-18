use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema)]
pub struct ConsolidatedReport {
    #[schema(example = "10")]
    pub total_entities_analyzed: i64,
    #[schema(example = "50")]
    pub total_submissions: i64,
    #[schema(example = "2.5")]
    pub overall_average_risk_level: f64,
    #[schema(example = "3.1")]
    pub overall_average_gap_score: f64,
    pub dimension_summaries: Vec<DimensionSummary>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct DimensionSummary {
    #[schema(example = "Finance")]
    pub dimension_name: String,
    #[schema(example = "3.2")]
    pub average_risk_level: f64,
    #[schema(example = "4.0")]
    pub average_gap_score: f64,
    pub risk_level_distribution: RiskLevelDistribution,
    pub top_recommendations: Vec<String>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct RiskLevelDistribution {
    #[schema(example = "60.0")]
    pub high_risk_percentage: f64,
    #[schema(example = "30.0")]
    pub medium_risk_percentage: f64,
    #[schema(example = "10.0")]
    pub low_risk_percentage: f64,
}
