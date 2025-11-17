use crate::entities::{action_items, recommendations};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ActionPlanResponse {
    pub action_plan_id: Uuid,
    pub assessment_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub action_items: Vec<ActionItemResponse>,
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
}

impl
    From<(action_items::Model, Option<recommendations::Model>)> for ActionItemResponse
{
    fn from(
        (item, recommendation): (
            action_items::Model,
            Option<recommendations::Model>,
        ),
    ) -> Self {
        let description = recommendation
            .map(|r| r.description)
            .unwrap_or_else(|| "".to_string());

        Self {
            action_item_id: item.id,
            dimension_assessment_id: item.dimension_assessment_id,
            status: item.status.to_string(),
            priority: item.priority.to_string(),
            title: description.clone(),
            description,
        }
    }
}
