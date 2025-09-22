use sea_orm::*;
use crate::entities::action_plans::{self, Entity as ActionPlans};
use crate::error::AppError;
use uuid::Uuid;

pub struct ActionPlansRepository;

impl ActionPlansRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<action_plans::Model>, AppError> {
        ActionPlans::find()
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_id(db: &DbConn, action_plan_id: Uuid) -> Result<Option<action_plans::Model>, AppError> {
        ActionPlans::find_by_id(action_plan_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn create(db: &DbConn, action_plan_data: action_plans::ActiveModel) -> Result<action_plans::Model, AppError> {
        action_plan_data
            .insert(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn update(
        db: &DbConn,
        action_plan_id: Uuid,
        action_plan_data: action_plans::ActiveModel,
    ) -> Result<action_plans::Model, AppError> {
        let action_plan = ActionPlans::find_by_id(action_plan_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Action plan not found".to_string()))?;

        let mut active_model: action_plans::ActiveModel = action_plan.into();
        
        if let ActiveValue::Set(assessment_id) = action_plan_data.assessment_id {
            active_model.assessment_id = Set(assessment_id);
        }
        if let ActiveValue::Set(report_id) = action_plan_data.report_id {
            active_model.report_id = Set(report_id);
        }
        if let ActiveValue::Set(title) = action_plan_data.title {
            active_model.title = Set(title);
        }
        if let ActiveValue::Set(description) = action_plan_data.description {
            active_model.description = Set(description);
        }
        if let ActiveValue::Set(status) = action_plan_data.status {
            active_model.status = Set(status);
        }
        if let ActiveValue::Set(target_completion_date) = action_plan_data.target_completion_date {
            active_model.target_completion_date = Set(target_completion_date);
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn delete(db: &DbConn, action_plan_id: Uuid) -> Result<bool, AppError> {
        let result = ActionPlans::delete_by_id(action_plan_id)
            .exec(db)
            .await
            .map_err(AppError::DatabaseError)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn find_by_assessment(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<Vec<action_plans::Model>, AppError> {
        ActionPlans::find()
            .filter(action_plans::Column::AssessmentId.eq(assessment_id))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_report(
        db: &DbConn,
        report_id: Uuid,
    ) -> Result<Vec<action_plans::Model>, AppError> {
        ActionPlans::find()
            .filter(action_plans::Column::ReportId.eq(report_id))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_status(db: &DbConn, status: crate::entities::action_plans::ActionPlanStatus) -> Result<Vec<action_plans::Model>, AppError> {
        ActionPlans::find()
            .filter(action_plans::Column::Status.eq(status))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_overdue(db: &DbConn) -> Result<Vec<action_plans::Model>, AppError> {
        let now = chrono::Utc::now();
        ActionPlans::find()
            .filter(
                Condition::all()
                    .add(action_plans::Column::TargetCompletionDate.lt(now))
                    .add(action_plans::Column::Status.ne(crate::entities::action_plans::ActionPlanStatus::Completed))
            )
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn update_status(
        db: &DbConn,
        action_plan_id: Uuid,
        status: crate::entities::action_plans::ActionPlanStatus,
    ) -> Result<action_plans::Model, AppError> {
        let action_plan = ActionPlans::find_by_id(action_plan_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Action plan not found".to_string()))?;

        let mut active_model: action_plans::ActiveModel = action_plan.into();
        active_model.status = Set(status);
        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn update_target_date(
        db: &DbConn,
        action_plan_id: Uuid,
        target_date: chrono::DateTime<chrono::Utc>,
    ) -> Result<action_plans::Model, AppError> {
        let action_plan = ActionPlans::find_by_id(action_plan_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Action plan not found".to_string()))?;

        let mut active_model: action_plans::ActiveModel = action_plan.into();
        active_model.target_completion_date = Set(Some(target_date));
        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }
}