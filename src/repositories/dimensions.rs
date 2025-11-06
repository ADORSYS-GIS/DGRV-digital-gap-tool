use crate::entities::dimensions::{self, Entity as Dimensions};
use crate::error::AppError;
use sea_orm::*;
use uuid::Uuid;

pub struct DimensionsRepository;

impl DimensionsRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<dimensions::Model>, AppError> {
        Dimensions::find().all(db).await.map_err(AppError::from)
    }

    pub async fn find_by_id(
        db: &DbConn,
        dimension_id: Uuid,
    ) -> Result<Option<dimensions::Model>, AppError> {
        Dimensions::find_by_id(dimension_id)
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn create(
        db: &DbConn,
        dimension_data: dimensions::ActiveModel,
    ) -> Result<dimensions::Model, AppError> {
        dimension_data.insert(db).await.map_err(AppError::from)
    }

    pub async fn update(
        db: &DbConn,
        dimension_id: Uuid,
        dimension_data: dimensions::ActiveModel,
    ) -> Result<dimensions::Model, AppError> {
        let dimension = Dimensions::find_by_id(dimension_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Dimension not found".to_string()))?;

        let mut active_model: dimensions::ActiveModel = dimension.into();

        // Check if fields are set in the input data
        if dimension_data.name.is_set() {
            active_model.name = dimension_data.name;
        }
        if dimension_data.description.is_set() {
            active_model.description = dimension_data.description;
        }
        if dimension_data.weight.is_set() {
            // Validate weight is between 0 and 100
            if let Some(weight) = dimension_data.weight.as_ref() {
                if *weight < 0 || *weight > 100 {
                    return Err(AppError::ValidationError(
                        "Weight must be between 0 and 100".to_string(),
                    ));
                }
            }
            active_model.weight = dimension_data.weight;
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }

    pub async fn delete(db: &DbConn, dimension_id: Uuid) -> Result<bool, AppError> {
        let result = Dimensions::delete_by_id(dimension_id)
            .exec(db)
            .await
            .map_err(AppError::from)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn find_by_name(
        db: &DbConn,
        name: &str,
    ) -> Result<Option<dimensions::Model>, AppError> {
        Dimensions::find()
            .filter(dimensions::Column::Name.eq(name))
            .one(db)
            .await
            .map_err(AppError::from)
    }
}
