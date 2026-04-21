use crate::entities::organisation_dimension::{self, Entity as OrganisationDimension};
use crate::error::AppError;
use sea_orm::*;
use uuid::Uuid;

pub struct OrganisationDimensionRepository;

impl OrganisationDimensionRepository {
    pub async fn assign(
        db: &DbConn,
        organisation_id: &str,
        dimension_keys: Vec<Uuid>,
    ) -> Result<Vec<organisation_dimension::Model>, AppError> {
        // Resolve dimension_key → English dimension_id for FK
        let dims = crate::repositories::dimensions::DimensionsRepository::find_all(db).await?;
        let new_assignments = dimension_keys
            .into_iter()
            .filter_map(|key| {
                // Use the English (or first available) dimension_id for the FK
                let dim = dims.iter().find(|d| d.dimension_key == key && d.language == "en")
                    .or_else(|| dims.iter().find(|d| d.dimension_key == key))?;
                Some(organisation_dimension::ActiveModel {
                    organisation_dimension: Set(Uuid::new_v4()),
                    organisation_id: Set(organisation_id.to_string()),
                    dimension_id: Set(dim.dimension_id),
                    dimension_key: Set(key),
                    created_at: Set(chrono::Utc::now()),
                    updated_at: Set(chrono::Utc::now()),
                })
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

    /// Returns the dimension_key values assigned to an organisation
    pub async fn list_dimension_keys_by_organisation(
        db: &DbConn,
        organisation_id: &str,
    ) -> Result<Vec<Uuid>, AppError> {
        let rows = Self::list_by_organisation(db, organisation_id).await?;
        Ok(rows.into_iter().map(|r| r.dimension_key).collect())
    }

    pub async fn remove(
        db: &DbConn,
        organisation_id: &str,
        dimension_key: Uuid,
    ) -> Result<bool, AppError> {
        let res = OrganisationDimension::delete_many()
            .filter(organisation_dimension::Column::OrganisationId.eq(organisation_id))
            .filter(organisation_dimension::Column::DimensionKey.eq(dimension_key))
            .exec(db)
            .await
            .map_err(AppError::from)?;
        Ok(res.rows_affected > 0)
    }

    pub async fn update_assignments(
        db: &DbConn,
        organisation_id: &str,
        dimension_keys: Vec<Uuid>,
    ) -> Result<(), AppError> {
        let dims = crate::repositories::dimensions::DimensionsRepository::find_all(db).await?;

        // Build assignments — one per dimension_key using English dimension_id as FK
        let valid_assignments: Vec<organisation_dimension::ActiveModel> = dimension_keys
            .into_iter()
            .filter_map(|key| {
                let dim = dims.iter().find(|d| d.dimension_key == key && d.language == "en")
                    .or_else(|| dims.iter().find(|d| d.dimension_key == key))?;
                Some(organisation_dimension::ActiveModel {
                    organisation_dimension: Set(Uuid::new_v4()),
                    organisation_id: Set(organisation_id.to_string()),
                    dimension_id: Set(dim.dimension_id),
                    dimension_key: Set(key),
                    created_at: Set(chrono::Utc::now()),
                    updated_at: Set(chrono::Utc::now()),
                })
            })
            .collect();

        let txn = db.begin().await?;

        OrganisationDimension::delete_many()
            .filter(organisation_dimension::Column::OrganisationId.eq(organisation_id))
            .exec(&txn)
            .await?;

        if !valid_assignments.is_empty() {
            OrganisationDimension::insert_many(valid_assignments)
                .exec(&txn)
                .await?;
        }

        txn.commit().await?;
        Ok(())
    }
}
