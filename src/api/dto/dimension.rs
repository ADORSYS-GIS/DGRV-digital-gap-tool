use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

/// Dimension creation request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateDimensionRequest {
    pub name: String,
    pub description: Option<String>,
    pub weight: Option<i32>,
    pub category: Option<String>,
    pub is_active: Option<bool>,
}

/// Dimension update request
#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
pub struct UpdateDimensionRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub weight: Option<i32>,
    pub category: Option<String>,
    pub is_active: Option<bool>,
}

/// Dimension response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
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
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateCurrentStateRequest {
    pub dimension_id: Uuid,
    pub description: Option<String>,
    pub score: i32,
    pub level: Option<String>,
}

/// Current state update request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UpdateCurrentStateRequest {
    pub description: Option<String>,
    pub score: Option<i32>,
    pub level: Option<String>,
}

/// Current state response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CurrentStateResponse {
    pub current_state_id: Uuid,
    pub dimension_id: Uuid,
    pub description: Option<String>,
    pub score: i32,
    pub level: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Desired state creation request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateDesiredStateRequest {
    pub dimension_id: Uuid,
    pub description: Option<String>,
    pub score: i32,
    pub level: Option<String>,
}

/// Desired state update request
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UpdateDesiredStateRequest {
    pub description: Option<String>,
    pub score: Option<i32>,
    pub level: Option<String>,
}

/// Desired state response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct DesiredStateResponse {
    pub desired_state_id: Uuid,
    pub dimension_id: Uuid,
    pub description: Option<String>,
    pub score: i32,
    pub level: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Dimension with states response
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct DimensionWithStatesResponse {
    pub dimension: DimensionResponse,
    pub current_states: Vec<CurrentStateResponse>,
    pub desired_states: Vec<DesiredStateResponse>,
}

/// Dimension list response with pagination
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct DimensionListResponse {
    pub dimensions: Vec<DimensionResponse>,
    pub total: u64,
    pub page: u32,
    pub limit: u32,
    pub total_pages: u32,
}
