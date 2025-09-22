use sea_orm::*;
use crate::entities::assessment_recommendations::{self, Entity as AssessmentRecommendations};
use crate::error::AppError;
use uuid::Uuid;

pub struct AssessmentRecommendationsRepository;

impl AssessmentRecommendationsRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<assessment_recommendations::Model>, AppError> {
        AssessmentRecommendations::find()
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_id(db: &DbConn, assessment_recommendation_id: Uuid) -> Result<Option<assessment_recommendations::Model>, AppError> {
        AssessmentRecommendations::find_by_id(assessment_recommendation_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn create(db: &DbConn, assessment_recommendation_data: assessment_recommendations::ActiveModel) -> Result<assessment_recommendations::Model, AppError> {
        assessment_recommendation_data
            .insert(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn update(
        db: &DbConn,
        assessment_recommendation_id: Uuid,
        assessment_recommendation_data: assessment_recommendations::ActiveModel,
    ) -> Result<assessment_recommendations::Model, AppError> {
        let assessment_recommendation = AssessmentRecommendations::find_by_id(assessment_recommendation_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Assessment recommendation not found".to_string()))?;

        let mut active_model: assessment_recommendations::ActiveModel = assessment_recommendation.into();
        
        if let ActiveValue::Set(assessment_id) = assessment_recommendation_data.assessment_id {
            active_model.assessment_id = Set(assessment_id);
        }
        if let ActiveValue::Set(recommendation_id) = assessment_recommendation_data.recommendation_id {
            active_model.recommendation_id = Set(recommendation_id);
        }
        if let ActiveValue::Set(gap_value) = assessment_recommendation_data.gap_value {
            active_model.gap_value = Set(gap_value);
        }
        if let ActiveValue::Set(is_selected) = assessment_recommendation_data.is_selected {
            active_model.is_selected = Set(is_selected);
        }
        if let ActiveValue::Set(custom_notes) = assessment_recommendation_data.custom_notes {
            active_model.custom_notes = Set(custom_notes);
        }
        if let ActiveValue::Set(implementation_status) = assessment_recommendation_data.implementation_status {
            active_model.implementation_status = Set(implementation_status);
        }
        if let ActiveValue::Set(selected_at) = assessment_recommendation_data.selected_at {
            active_model.selected_at = Set(selected_at);
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn delete(db: &DbConn, assessment_recommendation_id: Uuid) -> Result<bool, AppError> {
        let result = AssessmentRecommendations::delete_by_id(assessment_recommendation_id)
            .exec(db)
            .await
            .map_err(AppError::DatabaseError)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn find_by_assessment(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<Vec<assessment_recommendations::Model>, AppError> {
        AssessmentRecommendations::find()
            .filter(assessment_recommendations::Column::AssessmentId.eq(assessment_id))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_recommendation(
        db: &DbConn,
        recommendation_id: Uuid,
    ) -> Result<Vec<assessment_recommendations::Model>, AppError> {
        AssessmentRecommendations::find()
            .filter(assessment_recommendations::Column::RecommendationId.eq(recommendation_id))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_assessment_and_recommendation(
        db: &DbConn,
        assessment_id: Uuid,
        recommendation_id: Uuid,
    ) -> Result<Option<assessment_recommendations::Model>, AppError> {
        AssessmentRecommendations::find()
            .filter(
                Condition::all()
                    .add(assessment_recommendations::Column::AssessmentId.eq(assessment_id))
                    .add(assessment_recommendations::Column::RecommendationId.eq(recommendation_id))
            )
            .one(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn update_implementation_status(
        db: &DbConn,
        assessment_recommendation_id: Uuid,
        status: crate::entities::assessment_recommendations::ImplementationStatus,
    ) -> Result<assessment_recommendations::Model, AppError> {
        let assessment_recommendation = AssessmentRecommendations::find_by_id(assessment_recommendation_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Assessment recommendation not found".to_string()))?;

        let mut active_model: assessment_recommendations::ActiveModel = assessment_recommendation.into();
        active_model.implementation_status = Set(status);
        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }
}