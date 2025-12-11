use crate::entities::gaps::{self, Entity as Gaps};
use crate::error::AppError;
use crate::repositories::dimension_assessments::DimensionAssessmentsRepository;
use sea_orm::*;
use uuid::Uuid;

pub struct GapsRepository;

impl GapsRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<gaps::Model>, AppError> {
        Gaps::find().all(db).await.map_err(AppError::from)
    }

    pub async fn find_by_id(db: &DbConn, gap_id: Uuid) -> Result<Option<gaps::Model>, AppError> {
        Gaps::find_by_id(gap_id)
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn create(db: &DbConn, gap_data: gaps::ActiveModel) -> Result<gaps::Model, AppError> {
        gap_data.insert(db).await.map_err(AppError::from)
    }

    pub async fn update(
        db: &DbConn,
        gap_id: Uuid,
        gap_data: gaps::ActiveModel,
    ) -> Result<gaps::Model, AppError> {
        let gap = Gaps::find_by_id(gap_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Gap not found".to_string()))?;

        let mut active_model: gaps::ActiveModel = gap.into();

        if let ActiveValue::Set(dimension_id) = gap_data.dimension_id {
            active_model.dimension_id = Set(dimension_id);
        }
        if let ActiveValue::Set(gap_size) = gap_data.gap_size {
            active_model.gap_size = Set(gap_size);
        }
        if let ActiveValue::Set(gap_severity) = gap_data.gap_severity {
            active_model.gap_severity = Set(gap_severity);
        }
        if let ActiveValue::Set(gap_description) = gap_data.gap_description {
            active_model.gap_description = Set(gap_description);
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }

    pub async fn delete(db: &DbConn, gap_id: Uuid) -> Result<bool, AppError> {
        let result = Gaps::delete_by_id(gap_id)
            .exec(db)
            .await
            .map_err(AppError::from)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn find_by_dimension_assessment(
        db: &DbConn,
        dimension_assessment_id: Uuid,
    ) -> Result<Vec<gaps::Model>, AppError> {
        // Map the dimension assessment to its dimension_id, then query gaps by dimension_id
        if let Some(da) =
            DimensionAssessmentsRepository::find_by_id(db, dimension_assessment_id).await?
        {
            Gaps::find()
                .filter(gaps::Column::DimensionId.eq(da.dimension_id))
                .all(db)
                .await
                .map_err(AppError::from)
        } else {
            Ok(Vec::new())
        }
    }

    pub async fn find_by_severity(
        db: &DbConn,
        severity: crate::entities::gaps::GapSeverity,
    ) -> Result<Vec<gaps::Model>, AppError> {
        Gaps::find()
            .filter(gaps::Column::GapSeverity.eq(severity.to_value()))
            .all(db)
            .await
            .map_err(AppError::from)
    }
    pub async fn find_by_dimension_and_severity(
        db: &DbConn,
        dimension_id: Uuid,
        severity: crate::entities::gaps::GapSeverity,
    ) -> Result<Option<gaps::Model>, AppError> {
        Gaps::find()
            .filter(gaps::Column::DimensionId.eq(dimension_id))
            .filter(gaps::Column::GapSeverity.eq(severity.to_value()))
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_high_impact_gaps(
        db: &DbConn,
        min_impact_score: i32,
    ) -> Result<Vec<gaps::Model>, AppError> {
        Gaps::find()
            .filter(gaps::Column::GapSize.gte(min_impact_score))
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn update_severity(
        db: &DbConn,
        gap_id: Uuid,
        severity: crate::entities::gaps::GapSeverity,
    ) -> Result<gaps::Model, AppError> {
        let gap = Gaps::find_by_id(gap_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Gap not found".to_string()))?;

        let mut active_model: gaps::ActiveModel = gap.into();
        active_model.gap_severity = Set(severity);
        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }

    /// Find gaps by assessment ID through dimension assessments
    pub async fn find_by_assessment(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<Vec<gaps::Model>, AppError> {
        // Get dimensions involved in this assessment and query gaps by dimension_id
        let dimension_assessments =
            DimensionAssessmentsRepository::find_by_assessment_id(db, assessment_id).await?;
        let dimension_ids: Vec<Uuid> = dimension_assessments
            .into_iter()
            .map(|da| da.dimension_id)
            .collect();
        if dimension_ids.is_empty() {
            return Ok(Vec::new());
        }
        Gaps::find()
            .filter(gaps::Column::DimensionId.is_in(dimension_ids))
            .all(db)
            .await
            .map_err(AppError::from)
    }
}
