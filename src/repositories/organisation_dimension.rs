use sea_orm::*;
use crate::entities::organisation_dimension::{self, Entity as OrganisationDimension};
use crate::error::AppError;
use uuid::Uuid;

pub struct OrganisationDimensionRepository;

impl OrganisationDimensionRepository {
    pub async fn assign(
        db: &DbConn,
        organisation_id: &str,
        dimension_id: Uuid,
    ) -> Result<organisation_dimension::Model, AppError> {
        let active = organisation_dimension::ActiveModel {
            organisation_dimension: Set(Uuid::new_v4()),
            organisation_id: Set(organisation_id.to_string()),
            dimension_id: Set(dimension_id),
            created_at: Set(chrono::Utc::now()),
            updated_at: Set(chrono::Utc::now()),
        };

        active.insert(db).await.map_err(AppError::from)
    }

    pub async fn list_by_organisation(
        db: &DbConn,
        organisation_id: &str,
    ) -> Result<Vec<organisation_dimension::Model>, AppError> {
        OrganisationDimension::find()
            .filter(organisation_dimension::Column::OrganisationId.eq(organisation_id))
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn remove(
        db: &DbConn,
        organisation_id: &str,
        dimension_id: Uuid,
    ) -> Result<bool, AppError> {
        let res = OrganisationDimension::delete_many()
            .filter(organisation_dimension::Column::OrganisationId.eq(organisation_id))
            .filter(organisation_dimension::Column::DimensionId.eq(dimension_id))
            .exec(db)
            .await
            .map_err(AppError::from)?;
        Ok(res.rows_affected > 0)
    }
}
