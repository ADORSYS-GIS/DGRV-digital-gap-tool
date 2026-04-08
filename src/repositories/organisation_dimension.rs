use crate::entities::organisation_dimension::{self, Entity as OrganisationDimension};
use crate::error::AppError;
use sea_orm::*;
use uuid::Uuid;

pub struct OrganisationDimensionRepository;

impl OrganisationDimensionRepository {
    pub async fn assign(
        db: &DbConn,
        organisation_id: &str,
        dimension_ids: Vec<Uuid>,
    ) -> Result<Vec<organisation_dimension::Model>, AppError> {
        let new_assignments = dimension_ids
            .into_iter()
            .map(|dimension_id| organisation_dimension::ActiveModel {
                organisation_dimension: Set(Uuid::new_v4()),
                organisation_id: Set(organisation_id.to_string()),
                dimension_id: Set(dimension_id),
                created_at: Set(chrono::Utc::now()),
                updated_at: Set(chrono::Utc::now()),
            })
            .collect::<Vec<_>>();

        if new_assignments.is_empty() {
            return Ok(vec![]);
        }

        let res = OrganisationDimension::insert_many(new_assignments)
            .exec(db)
            .await?;

        OrganisationDimension::find()
            .filter(organisation_dimension::Column::OrganisationDimension.eq(res.last_insert_id))
            .all(db)
            .await
            .map_err(AppError::from)
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
        use crate::entities::dimensions::Entity as Dimensions;

        // Filter out dimension IDs that don't exist in the dimensions table
        let valid_dimensions = Dimensions::find()
            .filter(crate::entities::dimensions::Column::DimensionId.is_in(dimension_ids.clone()))
            .all(db)
            .await?;
        let valid_ids: Vec<Uuid> = valid_dimensions
            .into_iter()
            .map(|d| d.dimension_id)
            .collect();

        let txn = db.begin().await?;

        // Delete existing assignments
        OrganisationDimension::delete_many()
            .filter(organisation_dimension::Column::OrganisationId.eq(organisation_id))
            .exec(&txn)
            .await?;

        // Create new assignments with only valid dimension IDs
        if !valid_ids.is_empty() {
            let new_assignments = valid_ids
                .into_iter()
                .map(|dimension_id| organisation_dimension::ActiveModel {
                    organisation_dimension: Set(Uuid::new_v4()),
                    organisation_id: Set(organisation_id.to_string()),
                    dimension_id: Set(dimension_id),
                    created_at: Set(chrono::Utc::now()),
                    updated_at: Set(chrono::Utc::now()),
                });

            OrganisationDimension::insert_many(new_assignments)
                .exec(&txn)
                .await?;
        }

        txn.commit().await?;

        Ok(())
    }
}
