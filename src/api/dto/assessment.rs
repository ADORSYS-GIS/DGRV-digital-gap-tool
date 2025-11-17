use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;
use utoipa::ToSchema;
use uuid::Uuid;

/// Assessment creation request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateAssessmentRequest {
    pub organization_id: String,
    pub assessment_name: String,
    pub dimensions_id: Vec<String>,
}

/// Assessment update request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UpdateAssessmentRequest {
    pub assessment_name: Option<String>,
    pub dimensions_id: Option<Vec<String>>,
    pub status: Option<AssessmentStatus>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
}

/// Assessment response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct AssessmentResponse {
    pub assessment_id: Uuid,
    pub organization_id: String,
    pub document_title: String,
    pub status: AssessmentStatus,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub dimensions_id: Option<serde_json::Value>,
}

/// Assessment status enumeration
#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub enum AssessmentStatus {
    Draft,
    InProgress,
    Completed,
    Archived,
}

impl fmt::Display for AssessmentStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AssessmentStatus::Draft => write!(f, "draft"),
            AssessmentStatus::InProgress => write!(f, "in_progress"),
            AssessmentStatus::Completed => write!(f, "completed"),
            AssessmentStatus::Archived => write!(f, "archived"),
        }
    }
}

impl FromStr for AssessmentStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "draft" => Ok(AssessmentStatus::Draft),
            "in_progress" => Ok(AssessmentStatus::InProgress),
            "completed" => Ok(AssessmentStatus::Completed),
            "archived" => Ok(AssessmentStatus::Archived),
            _ => Err(format!("Invalid assessment status: {s}")),
        }
    }
}

/// Dimension assessment creation request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateDimensionAssessmentRequest {
    pub dimension_id: Uuid,
    pub current_state_id: Uuid,
    pub desired_state_id: Uuid,
    pub gap_score: i32,
}

/// Dimension assessment update request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UpdateDimensionAssessmentRequest {
    pub dimension_id: Uuid,
    pub gap_score: Option<i32>,
}

/// Dimension assessment response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct DimensionAssessmentResponse {
    pub dimension_assessment_id: Uuid,
    pub assessment_id: Uuid,
    pub dimension_id: Uuid,
    pub current_state_id: Uuid,
    pub desired_state_id: Uuid,
    pub gap_score: i32,
    pub gap_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Assessment summary response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct AssessmentSummaryResponse {
    pub assessment: AssessmentResponse,
    pub dimension_assessments: Vec<DimensionAssessmentResponse>,
    pub gaps_count: u32,
    pub recommendations_count: u32,
    pub overall_score: Option<i32>,
}

/// Assessment list response with pagination
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct AssessmentListResponse {
    pub assessments: Vec<AssessmentResponse>,
    pub total: u64,
    pub page: u32,
    pub limit: u32,
    pub total_pages: u32,
}
