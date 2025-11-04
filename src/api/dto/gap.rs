use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CreateGapRequest {
    pub dimension_assessment_id: Uuid,
    pub gap_size: i32,
    pub gap_description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct GapResponse {
    pub gap_id: Uuid,
    pub dimension_assessment_id: Uuid,
    pub dimension_id: Uuid,
    pub gap_size: i32,
    pub gap_severity: GapSeverity,
    pub gap_description: Option<String>,
    pub calculated_at: chrono::DateTime<chrono::Utc>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum GapSeverity {
    Low,
    Medium,
    High,
}

impl From<crate::entities::gaps::GapSeverity> for GapSeverity {
    fn from(value: crate::entities::gaps::GapSeverity) -> Self {
        match value {
            crate::entities::gaps::GapSeverity::Low => GapSeverity::Low,
            crate::entities::gaps::GapSeverity::Medium => GapSeverity::Medium,
            crate::entities::gaps::GapSeverity::High => GapSeverity::High,
        }
    }
}

impl From<GapSeverity> for crate::entities::gaps::GapSeverity {
    fn from(value: GapSeverity) -> Self {
        match value {
            GapSeverity::Low => crate::entities::gaps::GapSeverity::Low,
            GapSeverity::Medium => crate::entities::gaps::GapSeverity::Medium,
            GapSeverity::High => crate::entities::gaps::GapSeverity::High,
        }
    }
}

// Admin-config API DTOs

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct SeverityRuleDto {
    pub min_abs_gap: i32,
    pub max_abs_gap: i32,
    pub gap_severity: GapSeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct SetSeverityRulesRequest {
    // None (omitted) means global rules, Some for per-dimension overrides
    pub dimension_id: Option<Uuid>,
    pub rules: Vec<SeverityRuleDto>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct SetGapDescriptionRequest {
    pub dimension_id: Uuid,
    pub gap_size: i32,
    pub description: String,
}
