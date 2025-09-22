use sea_orm::*;
use crate::entities::dimension_assessments::{self, Entity as DimensionAssessments};
use crate::error::AppError;
use uuid::Uuid;

pub struct DimensionAssessmentsRepository;

impl DimensionAssessmentsRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find()
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_id(db: &DbConn, dimension_assessment_id: Uuid) -> Result<Option<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find_by_id(dimension_assessment_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn create(db: &DbConn, dimension_assessment_data: dimension_assessments::ActiveModel) -> Result<dimension_assessments::Model, AppError> {
        dimension_assessment_data
            .insert(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn update(
        db: &DbConn,
        dimension_assessment_id: Uuid,
        dimension_assessment_data: dimension_assessments::ActiveModel,
    ) -> Result<dimension_assessments::Model, AppError> {
        let dimension_assessment = DimensionAssessments::find_by_id(dimension_assessment_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Dimension assessment not found".to_string()))?;

        let mut active_model: dimension_assessments::ActiveModel = dimension_assessment.into();
        
        if let ActiveValue::Set(assessment_id) = dimension_assessment_data.assessment_id {
            active_model.assessment_id = Set(assessment_id);
        }
        if let ActiveValue::Set(dimension_id) = dimension_assessment_data.dimension_id {
            active_model.dimension_id = Set(dimension_id);
        }
        if let ActiveValue::Set(current_state_id) = dimension_assessment_data.current_state_id {
            active_model.current_state_id = Set(current_state_id);
        }
        if let ActiveValue::Set(desired_state_id) = dimension_assessment_data.desired_state_id {
            active_model.desired_state_id = Set(desired_state_id);
        }
        if let ActiveValue::Set(current_score) = dimension_assessment_data.current_score {
            active_model.current_score = Set(current_score);
        }
        if let ActiveValue::Set(desired_score) = dimension_assessment_data.desired_score {
            active_model.desired_score = Set(desired_score);
        }
        if let ActiveValue::Set(desired_state_id) = dimension_assessment_data.desired_state_id {
            active_model.desired_state_id = Set(desired_state_id);
        }
        if let ActiveValue::Set(current_score) = dimension_assessment_data.current_score {
            active_model.current_score = Set(current_score);
        }
        if let ActiveValue::Set(desired_score) = dimension_assessment_data.desired_score {
            active_model.desired_score = Set(desired_score);
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn delete(db: &DbConn, dimension_assessment_id: Uuid) -> Result<bool, AppError> {
        let result = DimensionAssessments::delete_by_id(dimension_assessment_id)
            .exec(db)
            .await
            .map_err(AppError::DatabaseError)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn find_by_assessment(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<Vec<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find()
            .filter(dimension_assessments::Column::AssessmentId.eq(assessment_id))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_dimension(
        db: &DbConn,
        dimension_id: Uuid,
    ) -> Result<Vec<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find()
            .filter(dimension_assessments::Column::DimensionId.eq(dimension_id))
            .all(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn find_by_assessment_and_dimension(
        db: &DbConn,
        assessment_id: Uuid,
        dimension_id: Uuid,
    ) -> Result<Option<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find()
            .filter(
                Condition::all()
                    .add(dimension_assessments::Column::AssessmentId.eq(assessment_id))
                    .add(dimension_assessments::Column::DimensionId.eq(dimension_id))
            )
            .one(db)
            .await
            .map_err(AppError::DatabaseError)
    }

    pub async fn update_dimension_score(
        db: &DbConn,
        dimension_assessment_id: Uuid,
        score: i32,
    ) -> Result<dimension_assessments::Model, AppError> {
        let dimension_assessment = DimensionAssessments::find_by_id(dimension_assessment_id)
            .one(db)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Dimension assessment not found".to_string()))?;

        let mut active_model: dimension_assessments::ActiveModel = dimension_assessment.into();
        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::DatabaseError)
    }
}