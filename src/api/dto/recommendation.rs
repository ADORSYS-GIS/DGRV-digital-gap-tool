use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;
use crate::entities::recommendations::RecommendationPriority as EntityPriority;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[schema(example = json!({
    "dimension_id": "550e8400-e29b-41d4-a716-446655440000",
    "priority": "HIGH",
    "description": "Implement automated testing for critical components"
}))]
pub struct CreateRecommendationRequest {
    /// Unique identifier of the dimension this recommendation is for
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub dimension_id: Uuid,
    
    /// Priority level of the recommendation
    #[schema(example = "HIGH")]
    pub priority: RecommendationPriority,
    
    /// Detailed description of the recommendation
    #[schema(example = "Implement automated testing for critical components")]
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[schema(example = json!({
    "recommendation_id": "550e8400-e29b-41d4-a716-446655440000",
    "dimension_id": "550e8400-e29b-41d4-a716-446655440002",
    "priority": "HIGH",
    "description": "Implement automated testing for critical components",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
}))]
pub struct RecommendationResponse {
    /// Unique identifier for the recommendation
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub recommendation_id: Uuid,
    
    /// Reference to the dimension
    #[schema(example = "550e8400-e29b-41d4-a716-446655440002")]
    pub dimension_id: Uuid,
    
    /// Priority level of the recommendation
    pub priority: RecommendationPriority,
    
    /// Detailed description of the recommendation
    #[schema(example = "Implement automated testing for critical components")]
    pub description: String,
    
    /// When the recommendation was created
    #[schema(example = "2023-01-01T00:00:00Z")]
    pub created_at: chrono::DateTime<chrono::Utc>,
    
    /// When the recommendation was last updated
    #[schema(example = "2023-01-01T00:00:00Z")]
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
#[schema(example = "HIGH")]
pub enum RecommendationPriority {
    #[serde(rename = "LOW")]
    Low,
    #[serde(rename = "MEDIUM")]
    Medium,
    #[serde(rename = "HIGH")]
    High,
}

impl From<EntityPriority> for RecommendationPriority {
    fn from(value: EntityPriority) -> Self {
        match value {
            EntityPriority::Low => RecommendationPriority::Low,
            EntityPriority::Medium => RecommendationPriority::Medium,
            EntityPriority::High => RecommendationPriority::High,
        }
    }
}

impl From<RecommendationPriority> for EntityPriority {
    fn from(value: RecommendationPriority) -> Self {
        match value {
            RecommendationPriority::Low => EntityPriority::Low,
            RecommendationPriority::Medium => EntityPriority::Medium,
            RecommendationPriority::High => EntityPriority::High,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UpdateRecommendationRequest {
    /// New priority level (optional)
    #[schema(example = "MEDIUM")]
    pub priority: Option<RecommendationPriority>,
    
    /// New description (optional)
    #[schema(example = "Updated recommendation with more details")]
    pub description: Option<String>,
}
