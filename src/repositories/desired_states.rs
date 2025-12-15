use crate::entities::desired_states::{self, Entity as DesiredStates};
use crate::error::AppError;
use sea_orm::ActiveValue::Set;
use sea_orm::*;
use uuid::Uuid;

pub struct DesiredStatesRepository;

impl DesiredStatesRepository {
    pub async fn find_by_score(
        db: &DbConn,
        score: i32,
    ) -> Result<Option<desired_states::Model>, AppError> {
        DesiredStates::find()
            .filter(desired_states::Column::Score.eq(score))
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_all(db: &DbConn) -> Result<Vec<desired_states::Model>, AppError> {
        DesiredStates::find().all(db).await.map_err(AppError::from)
    }

    pub async fn find_by_id(
        db: &DbConn,
        desired_state_id: Uuid,
    ) -> Result<Option<desired_states::Model>, AppError> {
        DesiredStates::find_by_id(desired_state_id)
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn create(
        db: &DbConn,
        desired_state_data: desired_states::ActiveModel,
    ) -> Result<desired_states::Model, AppError> {
        if let Set(score) = desired_state_data.score {
            if Self::find_by_score(db, score).await?.is_some() {
                return Err(AppError::LevelIdAlreadyExists);
            }
        }
        desired_state_data.insert(db).await.map_err(AppError::from)
    }

    pub async fn update(
        db: &DbConn,
        desired_state_id: Uuid,
        desired_state_data: desired_states::ActiveModel,
    ) -> Result<desired_states::Model, AppError> {
        let desired_state = DesiredStates::find_by_id(desired_state_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Desired state not found".to_string()))?;

        let mut active_model: desired_states::ActiveModel = desired_state.into();

        if let sea_orm::ActiveValue::Set(new_score) = desired_state_data.score {
            if let Some(existing_state) = Self::find_by_score(db, new_score).await? {
                if existing_state.desired_state_id != desired_state_id {
                    return Err(AppError::LevelIdAlreadyExists);
                }
            }
            active_model.score = Set(new_score);
        }

        if desired_state_data.dimension_id.is_set() {
            active_model.dimension_id = desired_state_data.dimension_id;
        }
        if desired_state_data.description.is_set() {
            active_model.description = desired_state_data.description;
        }
        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }

    pub async fn delete(db: &DbConn, desired_state_id: Uuid) -> Result<bool, AppError> {
        let result = DesiredStates::delete_by_id(desired_state_id)
            .exec(db)
            .await
            .map_err(AppError::from)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn find_by_dimension(
        db: &DbConn,
        dimension_id: Uuid,
    ) -> Result<Vec<desired_states::Model>, AppError> {
        DesiredStates::find()
            .filter(desired_states::Column::DimensionId.eq(dimension_id))
            .all(db)
            .await
            .map_err(AppError::from)
    }
}
