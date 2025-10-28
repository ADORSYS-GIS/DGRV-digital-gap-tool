use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::entities::reports::ReportFormat;
use std::fmt;
use std::str::FromStr;
use utoipa::ToSchema;

/// Report generation request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct GenerateReportRequest {
    pub assessment_id: Uuid,
    pub report_type: ReportType,
    pub format: ReportFormat,
    pub title: String,
    pub include_recommendations: Option<bool>,
    pub include_action_plans: Option<bool>,
    pub custom_sections: Option<Vec<String>>,
}

/// Report update request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UpdateReportRequest {
    pub title: Option<String>,
    pub summary: Option<String>,
    pub report_data: Option<serde_json::Value>,
}

/// Report response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ReportResponse {
    pub report_id: Uuid,
    pub assessment_id: Uuid,
    pub report_type: ReportType,
    pub title: String,
    pub format: ReportFormat,
    pub summary: Option<String>,
    pub report_data: Option<serde_json::Value>,
    pub file_path: Option<String>,
    pub status: ReportStatus,
    pub generated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Report type enumeration
#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub enum ReportType {
    Summary,
    Detailed,
    ActionPlan,
}

impl fmt::Display for ReportType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ReportType::Summary => write!(f, "summary"),
            ReportType::Detailed => write!(f, "detailed"),
            ReportType::ActionPlan => write!(f, "action_plan"),
        }
    }
}

impl FromStr for ReportType {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "summary" => Ok(ReportType::Summary),
            "detailed" => Ok(ReportType::Detailed),
            "action_plan" => Ok(ReportType::ActionPlan),
            _ => Err(format!("Invalid report type: {}", s)),
        }
    }
}

/// Report status enumeration
#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub enum ReportStatus {
    Pending,
    Generating,
    Completed,
    Failed,
    Archived,
}

impl fmt::Display for ReportStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ReportStatus::Pending => write!(f, "pending"),
            ReportStatus::Generating => write!(f, "generating"),
            ReportStatus::Completed => write!(f, "completed"),
            ReportStatus::Failed => write!(f, "failed"),
            ReportStatus::Archived => write!(f, "archived"),
        }
    }
}

impl FromStr for ReportStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "pending" => Ok(ReportStatus::Pending),
            "generating" => Ok(ReportStatus::Generating),
            "completed" => Ok(ReportStatus::Completed),
            "failed" => Ok(ReportStatus::Failed),
            "archived" => Ok(ReportStatus::Archived),
            _ => Err(format!("Invalid report status: {}", s)),
        }
    }
}

/// Report download response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ReportDownloadResponse {
    pub report: ReportResponse,
    pub download_url: Option<String>,
    pub file_size: Option<u64>,
    pub content_type: Option<String>,
}

/// Report list response with pagination
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ReportListResponse {
    pub reports: Vec<ReportResponse>,
    pub total: u64,
    pub page: u32,
    pub limit: u32,
    pub total_pages: u32,
}

/// Report generation status response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ReportStatusResponse {
    pub report_id: Uuid,
    pub status: ReportStatus,
    pub progress: Option<u8>,
    pub message: Option<String>,
    pub estimated_completion: Option<DateTime<Utc>>,
}
