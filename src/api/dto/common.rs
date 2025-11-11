use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;
use utoipa::ToSchema;
use uuid::Uuid;

/// Standard API response wrapper
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[aliases(
    ApiResponseActionPlanResponse = ApiResponse<crate::api::dto::action_plan::ActionPlanResponse>,
    ApiResponseActionPlanWithItemsResponse = ApiResponse<crate::api::dto::action_plan::ActionPlanWithItemsResponse>,
    ApiResponseActionItemResponse = ApiResponse<crate::api::dto::action_plan::ActionItemResponse>,
    ApiResponsePaginatedActionPlanResponse = ApiResponse<PaginatedResponse<crate::api::dto::action_plan::ActionPlanResponse>>,
    ApiResponseAssessmentResponse = ApiResponse<crate::api::dto::assessment::AssessmentResponse>,
    ApiResponseAssessmentSummaryResponse = ApiResponse<crate::api::dto::assessment::AssessmentSummaryResponse>,
    ApiResponsePaginatedAssessmentResponse = ApiResponse<PaginatedResponse<crate::api::dto::assessment::AssessmentResponse>>,
    ApiResponseDimensionAssessmentResponse = ApiResponse<crate::api::dto::assessment::DimensionAssessmentResponse>,
    ApiResponseDimensionResponse = ApiResponse<crate::api::dto::dimension::DimensionResponse>,
    ApiResponsePaginatedDimensionResponse = ApiResponse<PaginatedResponse<crate::api::dto::dimension::DimensionResponse>>,
    ApiResponseCurrentStateResponse = ApiResponse<crate::api::dto::dimension::CurrentStateResponse>,
    ApiResponseDesiredStateResponse = ApiResponse<crate::api::dto::dimension::DesiredStateResponse>,
    ApiResponseDimensionWithStatesResponse = ApiResponse<crate::api::dto::dimension::DimensionWithStatesResponse>,
    ApiResponseReportResponse = ApiResponse<crate::api::dto::report::ReportResponse>,
    ApiResponseReportDownloadResponse = ApiResponse<crate::api::dto::report::ReportDownloadResponse>,
    ApiResponseReportStatusResponse = ApiResponse<crate::api::dto::report::ReportStatusResponse>,
    ApiResponsePaginatedReportResponse = ApiResponse<PaginatedResponse<crate::api::dto::report::ReportResponse>>,
    ApiResponseGapResponse = ApiResponse<crate::api::dto::gap::GapResponse>,
    ApiResponsePaginatedGapResponse = ApiResponse<PaginatedResponse<crate::api::dto::gap::GapResponse>>,
    ApiResponseEmpty = ApiResponse<EmptyResponse>,
    ApiResponseAdminCreateGapRequest = ApiResponse<crate::api::dto::gap::AdminCreateGapRequest>
)]
pub struct ApiResponse<T>
where
    T: for<'a> ToSchema<'a>,
{
    pub success: bool,
    #[schema(inline)]
    pub data: Option<T>,
    pub message: Option<String>,
    pub error: Option<String>,
}


/// Empty response for operations that don't return data
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct EmptyResponse {}


impl<T> ApiResponse<T>
where
    T: for<'a> ToSchema<'a>,
{
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: None,
            error: None,
        }
    }

    pub fn success_with_message(data: T, message: String) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: Some(message),
            error: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            message: None,
            error: Some(message),
        }
    }
}

/// Pagination parameters
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct PaginationParams {
    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub sort_by: Option<String>,
    pub sort_order: Option<SortOrder>,
}

impl Default for PaginationParams {
    fn default() -> Self {
        Self {
            page: Some(1),
            limit: Some(20),
            sort_by: None,
            sort_order: Some(SortOrder::Desc),
        }
    }
}

/// Sort order enumeration
#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub enum SortOrder {
    Asc,
    Desc,
}

impl fmt::Display for SortOrder {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SortOrder::Asc => write!(f, "asc"),
            SortOrder::Desc => write!(f, "desc"),
        }
    }
}

impl FromStr for SortOrder {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "asc" => Ok(SortOrder::Asc),
            "desc" => Ok(SortOrder::Desc),
            _ => Err(format!("Invalid sort order: {s}")),
        }
    }
}

/// Paginated response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[aliases(
    PaginatedActionPlanResponse = PaginatedResponse<crate::api::dto::action_plan::ActionPlanResponse>,
    PaginatedReportResponse = PaginatedResponse<crate::api::dto::report::ReportResponse>,
    PaginatedDimensionResponse = PaginatedResponse<crate::api::dto::dimension::DimensionResponse>,
    PaginatedGapResponse = PaginatedResponse<crate::api::dto::gap::GapResponse>,
    PaginatedAssessmentResponse = PaginatedResponse<crate::api::dto::assessment::AssessmentResponse>
)]
pub struct PaginatedResponse<T>
where
    T: for<'a> ToSchema<'a>,
{
    #[schema(inline)]
    pub items: Vec<T>,
    pub total: u64,
    pub page: u32,
    pub limit: u32,
    pub total_pages: u32,
}

impl<T> PaginatedResponse<T>
where
    T: for<'a> ToSchema<'a>,
{
    pub fn new(items: Vec<T>, total: u64, page: u32, limit: u32) -> Self {
        let total_pages = ((total as f64) / (limit as f64)).ceil() as u32;
        Self {
            items,
            total,
            page,
            limit,
            total_pages,
        }
    }
}

/// Common timestamp fields
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct TimestampFields {
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// ID parameter for path variables
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct IdParam {
    pub id: Uuid,
}

/// Status enumeration for common status fields
#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub enum Status {
    Active,
    Inactive,
    Pending,
    Completed,
    Failed,
    Cancelled,
}

/// Priority enumeration
#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

impl fmt::Display for Priority {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Priority::Low => write!(f, "low"),
            Priority::Medium => write!(f, "medium"),
            Priority::High => write!(f, "high"),
            Priority::Critical => write!(f, "critical"),
        }
    }
}

impl FromStr for Priority {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "low" => Ok(Priority::Low),
            "medium" => Ok(Priority::Medium),
            "high" => Ok(Priority::High),
            "critical" => Ok(Priority::Critical),
            _ => Err(format!("Invalid priority: {s}")),
        }
    }
}
