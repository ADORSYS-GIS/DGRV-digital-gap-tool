use sea_orm::*;
use crate::entities::recommendations::{self, Entity as Recommendations};
use crate::error::AppError;
use uuid::Uuid;

pub struct RecommendationsRepository;

impl RecommendationsRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<recommendations::Model>, AppError> {
        Recommendations::find()
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_id(db: &DbConn, recommendation_id: Uuid) -> Result<Option<recommendations::Model>, AppError> {
        Recommendations::find_by_id(recommendation_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn create(db: &DbConn, recommendation_data: recommendations::ActiveModel) -> Result<recommendations::Model, AppError> {
        recommendation_data
            .insert(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn update(
        db: &DbConn,
        recommendation_id: Uuid,
        recommendation_data: recommendations::ActiveModel,
    ) -> Result<recommendations::Model, AppError> {
        let recommendation = Recommendations::find_by_id(recommendation_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Recommendation not found".to_string()))?;

        let mut active_model: recommendations::ActiveModel = recommendation.into();
        
        if let ActiveValue::Set(dimension_id) = recommendation_data.dimension_id {
            active_model.dimension_id = Set(dimension_id);
        }
        if let ActiveValue::Set(gap_severity) = recommendation_data.gap_severity {
            active_model.gap_severity = Set(gap_severity);
        }
        if let ActiveValue::Set(min_gap_size) = recommendation_data.min_gap_size {
            active_model.min_gap_size = Set(min_gap_size);
        }
        if let ActiveValue::Set(max_gap_size) = recommendation_data.max_gap_size {
            active_model.max_gap_size = Set(max_gap_size);
        }
        if let ActiveValue::Set(priority) = recommendation_data.priority {
            active_model.priority = Set(priority);
        }
        if let ActiveValue::Set(description) = recommendation_data.description {
            active_model.description = Set(description);
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn delete(db: &DbConn, recommendation_id: Uuid) -> Result<bool, AppError> {
        let result = Recommendations::delete_by_id(recommendation_id)
            .exec(db)
            .await
            .map_err(AppError::DatabaseError)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn find_by_dimension(
        db: &DbConn,
        dimension_id: Uuid,
    ) -> Result<Vec<recommendations::Model>, AppError> {
        Recommendations::find()
            .filter(recommendations::Column::DimensionId.eq(dimension_id))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_priority(db: &DbConn, priority: crate::entities::recommendations::RecommendationPriority) -> Result<Vec<recommendations::Model>, AppError> {
        Recommendations::find()
            .filter(recommendations::Column::Priority.eq(priority))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_high_priority(db: &DbConn) -> Result<Vec<recommendations::Model>, AppError> {
        Recommendations::find()
            .filter(recommendations::Column::Priority.eq(crate::entities::recommendations::RecommendationPriority::High))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }


    pub async fn update_priority(
        db: &DbConn,
        recommendation_id: Uuid,
        priority: crate::entities::recommendations::RecommendationPriority,
    ) -> Result<recommendations::Model, AppError> {
        let recommendation = Recommendations::find_by_id(recommendation_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Recommendation not found".to_string()))?;

        let mut active_model: recommendations::ActiveModel = recommendation.into();
        active_model.priority = Set(priority);
        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }
}