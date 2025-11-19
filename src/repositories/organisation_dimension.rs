use crate::entities::organisation_dimension::{self, Entity as OrganisationDimension};
use crate::error::AppError;
use sea_orm::*;
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

    pub async fn update_assignments(
        db: &DbConn,
        organisation_id: &str,
        dimension_ids: Vec<Uuid>,
    ) -> Result<(), AppError> {
        let txn = db.begin().await?;

        // Delete existing assignments
        OrganisationDimension::delete_many()
            .filter(organisation_dimension::Column::OrganisationId.eq(organisation_id))
            .exec(&txn)
            .await?;

        // Create new assignments
        let new_assignments = dimension_ids.into_iter().map(|dimension_id| {
            organisation_dimension::ActiveModel {
                organisation_dimension: Set(Uuid::new_v4()),
                organisation_id: Set(organisation_id.to_string()),
                dimension_id: Set(dimension_id),
                created_at: Set(chrono::Utc::now()),
                updated_at: Set(chrono::Utc::now()),
            }
        });

        if !new_assignments.clone().collect::<Vec<_>>().is_empty() {
            OrganisationDimension::insert_many(new_assignments)
                .exec(&txn)
                .await?;
        }

        txn.commit().await?;

        Ok(())
    }
}
