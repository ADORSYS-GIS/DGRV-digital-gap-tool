use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::fmt;
use std::str::FromStr;

/// Dimension creation request
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateDimensionRequest {
    pub name: String,
    pub description: Option<String>,
    pub weight: Option<i32>,
    pub category: Option<String>,
    pub is_active: Option<bool>,
}

/// Dimension update request
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateDimensionRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub weight: Option<i32>,
    pub category: Option<String>,
    pub is_active: Option<bool>,
}

/// Dimension response
#[derive(Debug, Serialize, Deserialize)]
pub struct DimensionResponse {
    pub dimension_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub weight: Option<i32>,
    pub category: Option<String>,
    pub is_active: Option<bool>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Current state creation request
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCurrentStateRequest {
    pub dimension_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub score: i32,
    pub level: Option<String>,
    pub characteristics: Option<String>,
}

/// Current state update request
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateCurrentStateRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub score: Option<i32>,
    pub level: Option<String>,
    pub characteristics: Option<String>,
}

/// Current state response
#[derive(Debug, Serialize, Deserialize)]
pub struct CurrentStateResponse {
    pub current_state_id: Uuid,
    pub dimension_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub score: i32,
    pub level: Option<String>,
    pub characteristics: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Desired state creation request
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateDesiredStateRequest {
    pub dimension_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub score: i32,
    pub level: Option<String>,
    pub target_date: Option<DateTime<Utc>>,
    pub success_criteria: Option<String>,
}

/// Desired state update request
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateDesiredStateRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub score: Option<i32>,
    pub level: Option<String>,
    pub target_date: Option<DateTime<Utc>>,
    pub success_criteria: Option<String>,
}

/// Desired state response
#[derive(Debug, Serialize, Deserialize)]
pub struct DesiredStateResponse {
    pub desired_state_id: Uuid,
    pub dimension_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub score: i32,
    pub level: Option<String>,
    pub target_date: Option<DateTime<Utc>>,
    pub success_criteria: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Dimension with states response
#[derive(Debug, Serialize, Deserialize)]
pub struct DimensionWithStatesResponse {
    pub dimension: DimensionResponse,
    pub current_states: Vec<CurrentStateResponse>,
    pub desired_states: Vec<DesiredStateResponse>,
}

/// Dimension list response with pagination
#[derive(Debug, Serialize, Deserialize)]
pub struct DimensionListResponse {
    pub dimensions: Vec<DimensionResponse>,
    pub total: u64,
    pub page: u32,
    pub limit: u32,
    pub total_pages: u32,
}
