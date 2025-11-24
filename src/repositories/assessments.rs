use crate::entities::assessments::{self, Entity as Assessments};
use crate::error::AppError;
use sea_orm::*;
use uuid::Uuid;

pub struct AssessmentsRepository;

impl AssessmentsRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<assessments::Model>, AppError> {
        Assessments::find().all(db).await.map_err(AppError::from)
    }

    pub async fn find_by_id(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<Option<assessments::Model>, AppError> {
        Assessments::find_by_id(assessment_id)
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn create(
        db: &DbConn,
        assessment_data: assessments::ActiveModel,
    ) -> Result<assessments::Model, AppError> {
        assessment_data.insert(db).await.map_err(AppError::from)
    }

    pub async fn update(
        db: &DbConn,
        assessment_id: Uuid,
        assessment_data: assessments::ActiveModel,
    ) -> Result<assessments::Model, AppError> {
        let assessment = Assessments::find_by_id(assessment_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Assessment not found".to_string()))?;

        let mut active_model: assessments::ActiveModel = assessment.into();

        if assessment_data.organization_id.is_set() {
            active_model.organization_id = assessment_data.organization_id;
        }
        if assessment_data.document_title.is_set() {
            active_model.document_title = assessment_data.document_title;
        }
        if assessment_data.status.is_set() {
            active_model.status = assessment_data.status;
        }
        if assessment_data.started_at.is_set() {
            active_model.started_at = assessment_data.started_at;
        }
        if assessment_data.completed_at.is_set() {
            active_model.completed_at = assessment_data.completed_at;
        }
        if assessment_data.dimensions_id.is_set() {
            active_model.dimensions_id = assessment_data.dimensions_id;
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }

    pub async fn delete(db: &DbConn, assessment_id: Uuid) -> Result<bool, AppError> {
        let result = Assessments::delete_by_id(assessment_id)
            .exec(db)
            .await
            .map_err(AppError::from)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn delete_by_organization_and_id(
        db: &DbConn,
        organization_id: String,
        assessment_id: Uuid,
    ) -> Result<bool, AppError> {
        let result = Assessments::delete_many()
            .filter(assessments::Column::OrganizationId.eq(organization_id))
            .filter(assessments::Column::AssessmentId.eq(assessment_id))
            .exec(db)
            .await
            .map_err(AppError::from)?;

        Ok(result.rows_affected > 0)
    }
 
    pub async fn find_by_organization_id(
        db: &DbConn,
        organization_id: String,
    ) -> Result<Vec<assessments::Model>, AppError> {
        Assessments::find()
            .filter(assessments::Column::OrganizationId.eq(organization_id))
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_latest_by_organization_id(
        db: &DbConn,
        organization_id: String,
    ) -> Result<Option<assessments::Model>, AppError> {
        Assessments::find()
            .filter(assessments::Column::OrganizationId.eq(organization_id))
            .order_by_desc(assessments::Column::CreatedAt)
            .one(db)
            .await
            .map_err(AppError::from)
    }
 
    pub async fn find_by_cooperation_id(
        db: &DbConn,
        cooperation_id: String,
    ) -> Result<Vec<assessments::Model>, AppError> {
        Assessments::find()
            .filter(assessments::Column::CooperationId.eq(cooperation_id))
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_latest_by_cooperation_id(
        db: &DbConn,
        cooperation_id: String,
    ) -> Result<Option<assessments::Model>, AppError> {
        Assessments::find()
            .filter(assessments::Column::CooperationId.eq(cooperation_id))
            .order_by_desc(assessments::Column::CreatedAt)
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_by_status(
        db: &DbConn,
        status: &str,
    ) -> Result<Vec<assessments::Model>, AppError> {
        Assessments::find()
            .filter(assessments::Column::Status.eq(status))
            .all(db)
            .await
            .map_err(AppError::from)
    }


    pub async fn update_status(
        db: &DbConn,
        assessment_id: Uuid,
        status: assessments::AssessmentStatus,
    ) -> Result<assessments::Model, AppError> {
        let assessment = Assessments::find_by_id(assessment_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Assessment not found".to_string()))?;

        let mut active_model: assessments::ActiveModel = assessment.into();
        active_model.status = Set(status);
        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }
}
