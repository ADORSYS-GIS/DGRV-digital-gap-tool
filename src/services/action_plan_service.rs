use crate::{
    entities::{action_items, dimension_assessments, recommendations},
    error::AppError,
    repositories::action_items::ActionItemsRepository,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, DbConn, EntityTrait, QueryFilter, Set};
use std::str::FromStr;
use std::sync::Arc;
use uuid::Uuid;

pub struct ActionPlanService {
    db: Arc<DbConn>,
}

impl ActionPlanService {
    pub fn new(db: Arc<DbConn>) -> Self {
        Self { db }
    }

    pub async fn create_action_item(
        &self,
        action_plan_id: Uuid,
        recommendation_id: Option<Uuid>,
        dimension_assessment_id: Uuid,
        title: String,
        description: String,
        priority: String,
    ) -> Result<action_items::Model, AppError> {
        // Validate priority string and convert to enum
        let item_priority = action_items::ActionItemPriority::from_str(priority.as_str())
            .map_err(|e| AppError::BadRequest(format!("Invalid priority: {}", e)))?;

        let final_recommendation_id = if let Some(id) = recommendation_id {
            id
        } else {
            // Create a new custom recommendation
            // First, get the dimension_id from the dimension_assessment
            let dimension_assessment =
                dimension_assessments::Entity::find_by_id(dimension_assessment_id)
                    .one(self.db.as_ref())
                    .await?
                    .ok_or_else(|| {
                        AppError::NotFound("Dimension assessment not found".to_string())
                    })?;

            let new_recommendation = recommendations::ActiveModel {
                recommendation_id: Set(Uuid::new_v4()),
                dimension_id: Set(dimension_assessment.dimension_id),
                priority: Set(recommendations::RecommendationPriority::Medium), // Default priority for custom items
                description: Set(format!("{}: {}", title, description)), // Combine title and description
                created_at: Set(chrono::Utc::now()),
                updated_at: Set(chrono::Utc::now()),
            };

            let saved_recommendation = new_recommendation.insert(self.db.as_ref()).await?;
            saved_recommendation.recommendation_id
        };

        let new_action_item = action_items::ActiveModel {
            id: Set(Uuid::new_v4()),
            action_plan_id: Set(action_plan_id),
            recommendation_id: Set(final_recommendation_id),
            dimension_assessment_id: Set(dimension_assessment_id),
            status: Set(action_items::ActionItemStatus::Todo), // Default status
            priority: Set(item_priority),
            created_at: Set(chrono::Utc::now()),
            updated_at: Set(chrono::Utc::now()),
        };

        ActionItemsRepository::create(self.db.as_ref(), new_action_item).await
    }
}

pub struct UpdateActionItemParams {
    pub action_item_id: Uuid,
    pub action_plan_id: Uuid,
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
    pub priority: Option<String>,
    pub dimension_assessment_id: Option<Uuid>,
    pub recommendation_id: Option<Uuid>,
}

impl ActionPlanService {
    pub async fn update_action_item(
        &self,
        params: UpdateActionItemParams,
    ) -> Result<action_items::Model, AppError> {
        let mut action_item: action_items::ActiveModel =
            action_items::Entity::find_by_id(params.action_item_id)
                .filter(action_items::Column::ActionPlanId.eq(params.action_plan_id))
                .one(self.db.as_ref())
                .await?
                .ok_or_else(|| AppError::NotFound("Action item not found".to_string()))?
                .into();

        if let Some(d) = params.description {
            let current_rec_id = action_item.recommendation_id.clone().unwrap();
            let mut rec: recommendations::ActiveModel =
                recommendations::Entity::find_by_id(current_rec_id)
                    .one(self.db.as_ref())
                    .await?
                    .ok_or_else(|| AppError::NotFound("Recommendation not found".to_string()))?
                    .into();

            let new_desc = if let Some(t) = &params.title {
                format!("{}: {}", t, d)
            } else {
                d
            };
            rec.description = Set(new_desc);
            rec.updated_at = Set(chrono::Utc::now());
            rec.update(self.db.as_ref()).await?;
        } else if let Some(t) = params.title {
            // Only title provided
            let current_rec_id = action_item.recommendation_id.clone().unwrap();
            let mut rec: recommendations::ActiveModel =
                recommendations::Entity::find_by_id(current_rec_id)
                    .one(self.db.as_ref())
                    .await?
                    .ok_or_else(|| AppError::NotFound("Recommendation not found".to_string()))?
                    .into();

            rec.description = Set(t);
            rec.updated_at = Set(chrono::Utc::now());
            rec.update(self.db.as_ref()).await?;
        }

        if let Some(s) = params.status {
            let item_status = action_items::ActionItemStatus::from_str(s.as_str())
                .map_err(|e| AppError::BadRequest(format!("Invalid status: {}", e)))?;
            action_item.status = Set(item_status);
        }
        if let Some(p) = params.priority {
            let item_priority = action_items::ActionItemPriority::from_str(p.as_str())
                .map_err(|e| AppError::BadRequest(format!("Invalid priority: {}", e)))?;
            action_item.priority = Set(item_priority);
        }
        if let Some(da_id) = params.dimension_assessment_id {
            action_item.dimension_assessment_id = Set(da_id);
        }
        if let Some(r_id) = params.recommendation_id {
            action_item.recommendation_id = Set(r_id);
        }

        action_item.updated_at = Set(chrono::Utc::now());
        ActionItemsRepository::update(self.db.as_ref(), action_item).await
    }

    pub async fn delete_action_item(
        &self,
        action_item_id: Uuid,
        action_plan_id: Uuid, // Ensure the action item belongs to this plan
    ) -> Result<(), AppError> {
        // Verify the action item exists and belongs to the specified action plan
        action_items::Entity::find_by_id(action_item_id)
            .filter(action_items::Column::ActionPlanId.eq(action_plan_id))
            .one(self.db.as_ref())
            .await?
            .ok_or_else(|| {
                AppError::NotFound(
                    "Action item not found or does not belong to the specified action plan"
                        .to_string(),
                )
            })?;

        ActionItemsRepository::delete(self.db.as_ref(), action_item_id).await
    }
}
