use sea_orm::*;
use crate::entities::action_items::{self, Entity as ActionItems};
use crate::error::AppError;
use uuid::Uuid;

pub struct ActionItemsRepository;

impl ActionItemsRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<action_items::Model>, AppError> {
        ActionItems::find()
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_id(db: &DbConn, action_item_id: Uuid) -> Result<Option<action_items::Model>, AppError> {
        ActionItems::find_by_id(action_item_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn create(db: &DbConn, action_item_data: action_items::ActiveModel) -> Result<action_items::Model, AppError> {
        action_item_data
            .insert(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn update(
        db: &DbConn,
        action_item_id: Uuid,
        action_item_data: action_items::ActiveModel,
    ) -> Result<action_items::Model, AppError> {
        let action_item = ActionItems::find_by_id(action_item_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Action item not found".to_string()))?;

        let mut active_model: action_items::ActiveModel = action_item.into();
        
        if let ActiveValue::Set(action_plan_id) = action_item_data.action_plan_id {
            active_model.action_plan_id = Set(action_plan_id);
        }
        if let ActiveValue::Set(recommendation_id) = action_item_data.recommendation_id {
            active_model.recommendation_id = Set(recommendation_id);
        }
        if let ActiveValue::Set(title) = action_item_data.title {
            active_model.title = Set(title);
        }
        if let ActiveValue::Set(description) = action_item_data.description {
            active_model.description = Set(description);
        }
        if let ActiveValue::Set(status) = action_item_data.status {
            active_model.status = Set(status);
        }
        if let ActiveValue::Set(priority) = action_item_data.priority {
            active_model.priority = Set(priority);
        }
        if let ActiveValue::Set(estimated_effort_hours) = action_item_data.estimated_effort_hours {
            active_model.estimated_effort_hours = Set(estimated_effort_hours);
        }
        if let ActiveValue::Set(estimated_cost) = action_item_data.estimated_cost {
            active_model.estimated_cost = Set(estimated_cost);
        }
        if let ActiveValue::Set(target_date) = action_item_data.target_date {
            active_model.target_date = Set(target_date);
        }
        if let ActiveValue::Set(completed_date) = action_item_data.completed_date {
            active_model.completed_date = Set(completed_date);
        }
        if let ActiveValue::Set(assigned_to) = action_item_data.assigned_to {
            active_model.assigned_to = Set(assigned_to);
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn delete(db: &DbConn, action_item_id: Uuid) -> Result<bool, AppError> {
        let result = ActionItems::delete_by_id(action_item_id)
            .exec(db)
            .await
            .map_err(AppError::DatabaseError)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn find_by_action_plan(
        db: &DbConn,
        action_plan_id: Uuid,
    ) -> Result<Vec<action_items::Model>, AppError> {
        ActionItems::find()
            .filter(action_items::Column::ActionPlanId.eq(action_plan_id))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_recommendation(
        db: &DbConn,
        recommendation_id: Uuid,
    ) -> Result<Vec<action_items::Model>, AppError> {
        ActionItems::find()
            .filter(action_items::Column::RecommendationId.eq(recommendation_id))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_status(db: &DbConn, status: crate::entities::action_items::ActionItemStatus) -> Result<Vec<action_items::Model>, AppError> {
        ActionItems::find()
            .filter(action_items::Column::Status.eq(status))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_priority(db: &DbConn, priority: crate::entities::action_items::ActionItemPriority) -> Result<Vec<action_items::Model>, AppError> {
        ActionItems::find()
            .filter(action_items::Column::Priority.eq(priority))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_assigned_to(db: &DbConn, assigned_to: &str) -> Result<Vec<action_items::Model>, AppError> {
        ActionItems::find()
            .filter(action_items::Column::AssignedTo.eq(assigned_to))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_overdue(db: &DbConn) -> Result<Vec<action_items::Model>, AppError> {
        let now = chrono::Utc::now();
        ActionItems::find()
            .filter(
                Condition::all()
                    .add(action_items::Column::TargetDate.lt(now))
                    .add(action_items::Column::Status.ne(crate::entities::action_items::ActionItemStatus::Completed))
            )
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn update_status(
        db: &DbConn,
        action_item_id: Uuid,
        status: crate::entities::action_items::ActionItemStatus,
    ) -> Result<action_items::Model, AppError> {
        let action_item = ActionItems::find_by_id(action_item_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Action item not found".to_string()))?;

        let mut active_model: action_items::ActiveModel = action_item.into();
        
        // Check if status is completed before setting it
        let is_completed = status == crate::entities::action_items::ActionItemStatus::Completed;
        
        active_model.status = Set(status);
        
        if is_completed {
            active_model.completed_date = Set(Some(chrono::Utc::now()));
        }
        
        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn mark_as_completed(
        db: &DbConn,
        action_item_id: Uuid,
    ) -> Result<action_items::Model, AppError> {
        let action_item = ActionItems::find_by_id(action_item_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Action item not found".to_string()))?;

        let mut active_model: action_items::ActiveModel = action_item.into();
        active_model.status = Set(crate::entities::action_items::ActionItemStatus::Completed);
        active_model.completed_date = Set(Some(chrono::Utc::now()));
        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }
}