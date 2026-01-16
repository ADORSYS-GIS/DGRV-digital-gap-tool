use crate::entities::{
    action_items,
    dimension_assessments::{self},
    dimensions, recommendations,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ActionPlanResponse {
    pub action_plan_id: Uuid,
    pub assessment_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub action_items: Vec<ActionItemResponse>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema, Validate)]
pub struct CreateActionItemRequest {
    #[validate(length(min = 1, message = "Title cannot be empty"))]
    pub title: String,
    #[validate(length(min = 1, message = "Description cannot be empty"))]
    pub description: String,
    pub priority: String, // Will be validated in service layer
    pub dimension_assessment_id: Uuid,
    pub recommendation_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema, Validate)]
pub struct UpdateActionItemRequest {
    #[validate(length(min = 1, message = "Title cannot be empty"))]
    pub title: Option<String>,
    #[validate(length(min = 1, message = "Description cannot be empty"))]
    pub description: Option<String>,
    pub status: Option<String>,   // Will be validated in service layer
    pub priority: Option<String>, // Will be validated in service layer
    pub dimension_assessment_id: Option<Uuid>,
    pub recommendation_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ActionPlanWithItemsResponse {
    pub action_plan_id: Uuid,
    pub assessment_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub action_items: Vec<ActionItemResponse>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ActionItemResponse {
    pub action_item_id: Uuid,
    pub dimension_assessment_id: Uuid,
    pub status: String,
    pub priority: String,
    pub title: String,
    pub description: String,
    pub dimension: String,
}

impl
    From<(
        action_items::Model,
        Option<recommendations::Model>,
        Option<(dimension_assessments::Model, Option<dimensions::Model>)>,
    )> for ActionItemResponse
{
    fn from(
        (item, recommendation, dimension_assessment_info): (
            action_items::Model,
            Option<recommendations::Model>,
            Option<(dimension_assessments::Model, Option<dimensions::Model>)>,
        ),
    ) -> Self {
        let description = recommendation
            .map(|r| r.description)
            .unwrap_or_else(|| "".to_string());
        let dimension = dimension_assessment_info
            .and_then(|(_, dim_opt)| dim_opt.map(|dim| dim.name))
            .unwrap_or_else(|| "".to_string());

        Self {
            action_item_id: item.id,
            dimension_assessment_id: item.dimension_assessment_id,
            status: item.status.to_string(),
            priority: item.priority.to_string(),
            title: description.clone(),
            description,
            dimension,
        }
    }
}
