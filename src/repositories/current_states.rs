use crate::entities::current_states::{self, Entity as CurrentStates};
use crate::error::AppError;
use sea_orm::*;
use uuid::Uuid;

pub struct CurrentStatesRepository;

impl CurrentStatesRepository {
    pub async fn find_by_score(
        db: &DbConn,
        score: i32,
    ) -> Result<Option<current_states::Model>, AppError> {
        CurrentStates::find()
            .filter(current_states::Column::Score.eq(score))
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_all(db: &DbConn) -> Result<Vec<current_states::Model>, AppError> {
        CurrentStates::find().all(db).await.map_err(AppError::from)
    }

    pub async fn find_by_id(
        db: &DbConn,
        current_state_id: Uuid,
    ) -> Result<Option<current_states::Model>, AppError> {
        CurrentStates::find_by_id(current_state_id)
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn create(
        db: &DbConn,
        current_state_data: current_states::ActiveModel,
    ) -> Result<current_states::Model, AppError> {
        if let Set(score) = current_state_data.score {
            if Self::find_by_score(db, score).await?.is_some() {
                return Err(AppError::LevelIdAlreadyExists);
            }
        }
        current_state_data.insert(db).await.map_err(AppError::from)
    }

    pub async fn update(
        db: &DbConn,
        current_state_id: Uuid,
        current_state_data: current_states::ActiveModel,
    ) -> Result<current_states::Model, AppError> {
        let current_state = CurrentStates::find_by_id(current_state_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Current state not found".to_string()))?;

        let mut active_model: current_states::ActiveModel = current_state.into();

        if let Set(new_score) = current_state_data.score {
            if let Some(existing_state) = Self::find_by_score(db, new_score).await? {
                if existing_state.current_state_id != current_state_id {
                    return Err(AppError::LevelIdAlreadyExists);
                }
            }
            active_model.score = Set(new_score);
        }

        if current_state_data.dimension_id.is_set() {
            active_model.dimension_id = current_state_data.dimension_id;
        }
        if current_state_data.description.is_set() {
            active_model.description = current_state_data.description;
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }

    pub async fn delete(db: &DbConn, current_state_id: Uuid) -> Result<bool, AppError> {
        let result = CurrentStates::delete_by_id(current_state_id)
            .exec(db)
            .await
            .map_err(AppError::from)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn find_by_dimension(
        db: &DbConn,
        dimension_id: Uuid,
    ) -> Result<Vec<current_states::Model>, AppError> {
        CurrentStates::find()
            .filter(current_states::Column::DimensionId.eq(dimension_id))
            .all(db)
            .await
            .map_err(AppError::from)
    }
}
