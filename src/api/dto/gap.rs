use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[schema(example = json!({ "dimension_assessment_id": "550e8400-e29b-41d4-a716-446655440000", "gap_size": 3, "gap_description": "Significant gap in digital transformation" }))]
pub struct CreateGapRequest {
    /// Unique identifier of the dimension assessment this gap belongs to
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub dimension_assessment_id: Uuid,
    
    /// The size of the gap (numeric value)
    #[schema(example = 3)]
    pub gap_size: i32,
    
    /// Human-readable description of the gap
    #[schema(example = "Significant gap in digital transformation")]
    pub gap_description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[schema(example = json!({
    "gap_id": "550e8400-e29b-41d4-a716-446655440000",
    "dimension_assessment_id": "550e8400-e29b-41d4-a716-446655440001",
    "dimension_id": "550e8400-e29b-41d4-a716-446655440002",
    "gap_size": 3,
    "gap_severity": "HIGH",
    "gap_description": "Significant gap in digital transformation",
    "calculated_at": "2023-01-01T00:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
}))]
pub struct GapResponse {
    /// Unique identifier for the gap
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub gap_id: Uuid,
    
    /// Reference to the dimension assessment
    #[schema(example = "550e8400-e29b-41d4-a716-446655440001")]
    pub dimension_assessment_id: Uuid,
    
    /// Reference to the dimension
    #[schema(example = "550e8400-e29b-41d4-a716-446655440002")]
    pub dimension_id: Uuid,
    
    /// Numeric size of the gap
    #[schema(example = 3)]
    pub gap_size: i32,
    
    /// Severity level of the gap
    pub gap_severity: GapSeverity,
    
    /// Optional description of the gap
    #[schema(example = "Significant gap in digital transformation")]
    pub gap_description: Option<String>,
    
    /// When the gap was calculated
    #[schema(example = "2023-01-01T00:00:00Z")]
    pub calculated_at: chrono::DateTime<chrono::Utc>,
    
    /// When the gap was created
    #[schema(example = "2023-01-01T00:00:00Z")]
    pub created_at: chrono::DateTime<chrono::Utc>,
    
    /// When the gap was last updated
    #[schema(example = "2023-01-01T00:00:00Z")]
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
#[schema(example = "HIGH")]
pub enum GapSeverity {
    /// Low severity gap
    #[schema(rename = "LOW")]
    Low,
    
    /// Medium severity gap
    #[schema(rename = "MEDIUM")]
    Medium,
    
    /// High severity gap
    #[schema(rename = "HIGH")]
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

/// Update gap request
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateGapRequest {
    /// New gap size; if provided, severity will be recalculated
    pub gap_size: Option<i32>,
    /// New human-readable description
    pub gap_description: Option<String>,
}

/// Admin configuration payload to merge severity rules and descriptions in a single endpoint
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct AdminGapConfigRequest {
    /// Optional set of severity rules to upsert (global or per-dimension)
    pub severity_rules: Option<SetSeverityRulesRequest>,
    /// Optional list of gap descriptions to upsert
    pub descriptions: Option<Vec<SetGapDescriptionRequest>>,
}
