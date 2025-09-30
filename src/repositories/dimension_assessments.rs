use sea_orm::*;
use crate::entities::dimension_assessments::{self, Entity as DimensionAssessments};
use crate::error::AppError;
use crate::services::dimension_scoring::DimensionScoringService;
use uuid::Uuid;

pub struct DimensionAssessmentsRepository;

impl DimensionAssessmentsRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find()
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_by_id(db: &DbConn, dimension_assessment_id: Uuid) -> Result<Option<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find_by_id(dimension_assessment_id)
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_by_assessment_id(db: &DbConn, assessment_id: Uuid) -> Result<Vec<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find()
            .filter(dimension_assessments::Column::AssessmentId.eq(assessment_id))
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn create(db: &DbConn, assessment_data: dimension_assessments::ActiveModel) -> Result<dimension_assessments::Model, AppError> {
        assessment_data
            .insert(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn update(
        db: &DbConn,
        dimension_assessment_id: Uuid,
        assessment_data: dimension_assessments::ActiveModel,
    ) -> Result<dimension_assessments::Model, AppError> {
        let assessment = DimensionAssessments::find_by_id(dimension_assessment_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Dimension assessment not found".to_string()))?;

        let mut active_model: dimension_assessments::ActiveModel = assessment.into();
        
        // Update fields if they are set
        if assessment_data.assessment_id.is_set() {
            active_model.assessment_id = assessment_data.assessment_id;
        }
        if assessment_data.dimension_id.is_set() {
            active_model.dimension_id = assessment_data.dimension_id;
        }
        if assessment_data.current_state_id.is_set() {
            active_model.current_state_id = assessment_data.current_state_id;
        }
        if assessment_data.desired_state_id.is_set() {
            active_model.desired_state_id = assessment_data.desired_state_id;
        }
        if assessment_data.current_score.is_set() {
            active_model.current_score = assessment_data.current_score;
        }
        if assessment_data.desired_score.is_set() {
            active_model.desired_score = assessment_data.desired_score;
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model
            .update(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn delete(db: &DbConn, dimension_assessment_id: Uuid) -> Result<bool, AppError> {
        let result = DimensionAssessments::delete_by_id(dimension_assessment_id)
            .exec(db)
            .await
            .map_err(AppError::from)?;

        Ok(result.rows_affected > 0)
    }

    /// Calculate weighted scores for all dimension assessments in an assessment
    pub async fn calculate_weighted_scores(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<Vec<(Uuid, f64)>, AppError> {
        let assessments = Self::find_by_assessment_id(db, assessment_id).await?;
        let mut weighted_scores = Vec::new();

        for assessment in assessments {
            // Get the dimension to retrieve its weight
            let dimension = crate::entities::dimensions::Entity::find_by_id(assessment.dimension_id)
                .one(db)
                .await
                .map_err(AppError::DatabaseError)?
                .ok_or_else(|| AppError::NotFound("Dimension not found".to_string()))?;

            let gap_size = assessment.desired_score - assessment.current_score;
            let weighted_score = DimensionScoringService::calculate_weighted_score(
                gap_size,
                dimension.weight,
            )?;

            weighted_scores.push((assessment.dimension_assessment_id, weighted_score));
        }

        Ok(weighted_scores)
    }

    /// Get priority scores for dimension assessments based on weights and gap sizes
    pub async fn get_priority_scores(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<Vec<(Uuid, i32)>, AppError> {
        let assessments = Self::find_by_assessment_id(db, assessment_id).await?;
        let mut priority_scores = Vec::new();

        for assessment in assessments {
            // Get the dimension to retrieve its weight
            let dimension = crate::entities::dimensions::Entity::find_by_id(assessment.dimension_id)
                .one(db)
                .await
                .map_err(AppError::DatabaseError)?
                .ok_or_else(|| AppError::NotFound("Dimension not found".to_string()))?;

            let gap_size = assessment.desired_score - assessment.current_score;
            let priority_score = DimensionScoringService::calculate_priority_score(
                gap_size,
                dimension.weight,
            )?;

            priority_scores.push((assessment.dimension_assessment_id, priority_score));
        }

        Ok(priority_scores)
    }
}