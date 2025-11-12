use crate::entities::dimension_assessments::{self, Entity as DimensionAssessments};
use crate::error::AppError;
use sea_orm::*;
use uuid::Uuid;

pub struct DimensionAssessmentsRepository;

impl DimensionAssessmentsRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find()
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_by_id(
        db: &DbConn,
        dimension_assessment_id: Uuid,
    ) -> Result<Option<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find_by_id(dimension_assessment_id)
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_by_assessment_id(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<Vec<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find()
            .filter(dimension_assessments::Column::AssessmentId.eq(assessment_id))
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_by_assessment_and_dimension(
        db: &DbConn,
        assessment_id: Uuid,
        dimension_id: Uuid,
    ) -> Result<Option<dimension_assessments::Model>, AppError> {
        DimensionAssessments::find()
            .filter(dimension_assessments::Column::AssessmentId.eq(assessment_id))
            .filter(dimension_assessments::Column::DimensionId.eq(dimension_id))
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn create(
        db: &DbConn,
        assessment_data: dimension_assessments::ActiveModel,
    ) -> Result<dimension_assessments::Model, AppError> {
        assessment_data.insert(db).await.map_err(AppError::from)
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

        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }

    pub async fn delete(db: &DbConn, dimension_assessment_id: Uuid) -> Result<bool, AppError> {
        let result = DimensionAssessments::delete_by_id(dimension_assessment_id)
            .exec(db)
            .await
            .map_err(AppError::from)?;

        Ok(result.rows_affected > 0)
    }
}
