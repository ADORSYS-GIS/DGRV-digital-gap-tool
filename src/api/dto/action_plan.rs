use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::fmt;
use std::str::FromStr;
use utoipa::ToSchema;

/// Action plan creation request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateActionPlanRequest {
    pub assessment_id: Uuid,
    pub report_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub status: Option<ActionPlanStatus>,
    pub target_completion_date: Option<DateTime<Utc>>,
    pub priority: Option<ActionItemPriority>,
    pub estimated_budget: Option<rust_decimal::Decimal>,
    pub responsible_person: Option<String>,
}

/// Action plan update request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UpdateActionPlanRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<ActionPlanStatus>,
    pub target_completion_date: Option<DateTime<Utc>>,
    pub priority: Option<ActionItemPriority>,
    pub estimated_budget: Option<rust_decimal::Decimal>,
    pub responsible_person: Option<String>,
}

/// Action plan response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ActionPlanResponse {
    pub action_plan_id: Uuid,
    pub assessment_id: Uuid,
    pub report_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub status: ActionPlanStatus,
    pub target_completion_date: Option<DateTime<Utc>>,
    pub priority: ActionItemPriority,
    pub estimated_budget: Option<rust_decimal::Decimal>,
    pub responsible_person: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Action plan status enumeration
#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub enum ActionPlanStatus {
    Draft,
    Active,
    Completed,
    Cancelled,
}

impl fmt::Display for ActionPlanStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ActionPlanStatus::Draft => write!(f, "draft"),
            ActionPlanStatus::Active => write!(f, "active"),
            ActionPlanStatus::Completed => write!(f, "completed"),
            ActionPlanStatus::Cancelled => write!(f, "cancelled"),
        }
    }
}

impl FromStr for ActionPlanStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "draft" => Ok(ActionPlanStatus::Draft),
            "active" => Ok(ActionPlanStatus::Active),
            "completed" => Ok(ActionPlanStatus::Completed),
            "cancelled" => Ok(ActionPlanStatus::Cancelled),
            _ => Err(format!("Invalid action plan status: {}", s)),
        }
    }
}

/// Action item creation request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateActionItemRequest {
    pub action_plan_id: Uuid,
    pub recommendation_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub status: ActionItemStatus,
    pub priority: ActionItemPriority,
    pub estimated_effort_hours: Option<i32>,
    pub estimated_cost: Option<rust_decimal::Decimal>,
    pub target_date: Option<DateTime<Utc>>,
    pub assigned_to: Option<String>,
}

/// Action item update request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UpdateActionItemRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<ActionItemStatus>,
    pub priority: Option<ActionItemPriority>,
    pub estimated_effort_hours: Option<i32>,
    pub estimated_cost: Option<rust_decimal::Decimal>,
    pub target_date: Option<DateTime<Utc>>,
    pub completed_date: Option<DateTime<Utc>>,
    pub assigned_to: Option<String>,
}

/// Action item response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ActionItemResponse {
    pub action_item_id: Uuid,
    pub action_plan_id: Uuid,
    pub recommendation_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub status: ActionItemStatus,
    pub priority: ActionItemPriority,
    pub estimated_effort_hours: Option<i32>,
    pub estimated_cost: Option<rust_decimal::Decimal>,
    pub target_date: Option<DateTime<Utc>>,
    pub completed_date: Option<DateTime<Utc>>,
    pub assigned_to: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Action item status enumeration
#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub enum ActionItemStatus {
    Pending,
    InProgress,
    Completed,
    Cancelled,
}

impl fmt::Display for ActionItemStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ActionItemStatus::Pending => write!(f, "pending"),
            ActionItemStatus::InProgress => write!(f, "in_progress"),
            ActionItemStatus::Completed => write!(f, "completed"),
            ActionItemStatus::Cancelled => write!(f, "cancelled"),
        }
    }
}

impl FromStr for ActionItemStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "pending" => Ok(ActionItemStatus::Pending),
            "in_progress" => Ok(ActionItemStatus::InProgress),
            "completed" => Ok(ActionItemStatus::Completed),
            "cancelled" => Ok(ActionItemStatus::Cancelled),
            _ => Err(format!("Invalid action item status: {}", s)),
        }
    }
}

/// Action item priority enumeration
#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub enum ActionItemPriority {
    Low,
    Medium,
    High,
    Urgent,
}

impl fmt::Display for ActionItemPriority {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ActionItemPriority::Low => write!(f, "low"),
            ActionItemPriority::Medium => write!(f, "medium"),
            ActionItemPriority::High => write!(f, "high"),
            ActionItemPriority::Urgent => write!(f, "urgent"),
        }
    }
}

impl FromStr for ActionItemPriority {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "low" => Ok(ActionItemPriority::Low),
            "medium" => Ok(ActionItemPriority::Medium),
            "high" => Ok(ActionItemPriority::High),
            "urgent" => Ok(ActionItemPriority::Urgent),
            _ => Err(format!("Invalid action item priority: {}", s)),
        }
    }
}

/// Action plan with items response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ActionPlanWithItemsResponse {
    pub action_plan: ActionPlanResponse,
    pub action_items: Vec<ActionItemResponse>,
    pub total_items: u32,
    pub completed_items: u32,
    pub progress_percentage: f64,
}

/// Action plan list response with pagination
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ActionPlanListResponse {
    pub action_plans: Vec<ActionPlanResponse>,
    pub total: u64,
    pub page: u32,
    pub limit: u32,
    pub total_pages: u32,
}

/// Action item list response with pagination
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ActionItemListResponse {
    pub action_items: Vec<ActionItemResponse>,
    pub total: u64,
    pub page: u32,
    pub limit: u32,
    pub total_pages: u32,
}
