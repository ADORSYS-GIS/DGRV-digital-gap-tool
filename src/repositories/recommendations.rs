use crate::entities::recommendations::{self, Entity as Recommendations};
use crate::error::AppError;
use sea_orm::*;
use uuid::Uuid;

pub struct RecommendationsRepository;

impl RecommendationsRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<recommendations::Model>, AppError> {
        Recommendations::find()
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_by_id(
        db: &DbConn,
        recommendation_id: Uuid,
    ) -> Result<Option<recommendations::Model>, AppError> {
        Recommendations::find_by_id(recommendation_id)
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn create(
        db: &DbConn,
        recommendation_data: recommendations::ActiveModel,
    ) -> Result<recommendations::Model, AppError> {
        recommendation_data.insert(db).await.map_err(AppError::from)
    }

    pub async fn update(
        db: &DbConn,
        recommendation_id: Uuid,
        recommendation_data: recommendations::ActiveModel,
    ) -> Result<recommendations::Model, AppError> {
        let recommendation = Recommendations::find_by_id(recommendation_id)
            .one(db)
            .await
            .map_err(AppError::from)?
            .ok_or_else(|| AppError::NotFound("Recommendation not found".to_string()))?;

        let mut active_model: recommendations::ActiveModel = recommendation.into();

        if let ActiveValue::Set(dimension_id) = recommendation_data.dimension_id {
            active_model.dimension_id = Set(dimension_id);
        }
        if let ActiveValue::Set(priority) = recommendation_data.priority {
            active_model.priority = Set(priority);
        }
        if let ActiveValue::Set(description) = recommendation_data.description {
            active_model.description = Set(description);
        }
        if let ActiveValue::Set(language) = recommendation_data.language {
            active_model.language = Set(language);
        }

        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }

    pub async fn delete(db: &DbConn, recommendation_id: Uuid) -> Result<bool, AppError> {
        let result = Recommendations::delete_by_id(recommendation_id)
            .exec(db)
            .await
            .map_err(AppError::from)?;

        Ok(result.rows_affected > 0)
    }

    pub async fn find_by_dimension(
        db: &DbConn,
        dimension_id: Uuid,
    ) -> Result<Vec<recommendations::Model>, AppError> {
        Recommendations::find()
            .filter(recommendations::Column::DimensionId.eq(dimension_id))
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_admin_by_dimension(
        db: &DbConn,
        dimension_id: Uuid,
    ) -> Result<Vec<recommendations::Model>, AppError> {
        Recommendations::find()
            .filter(recommendations::Column::DimensionId.eq(dimension_id))
            .filter(recommendations::Column::Source.eq("admin"))
            .all(db)
            .await
            .map_err(AppError::from)
    }
    pub async fn find_by_dimension_and_priority(
        db: &DbConn,
        dimension_id: Uuid,
        priority: &str,
    ) -> Result<Option<recommendations::Model>, AppError> {
        let priority_enum = match priority {
            "Low" => crate::entities::recommendations::RecommendationPriority::Low,
            "Medium" => crate::entities::recommendations::RecommendationPriority::Medium,
            "High" => crate::entities::recommendations::RecommendationPriority::High,
            _ => return Err(AppError::ValidationError("Invalid priority".to_string())),
        };

        // Only return admin-created recommendations as defaults.
        // User-created recommendations (source = "action_plan") must never
        // leak into other submissions as default action items.
        Recommendations::find()
            .filter(recommendations::Column::DimensionId.eq(dimension_id))
            .filter(recommendations::Column::Priority.eq(priority_enum))
            .filter(recommendations::Column::Source.eq("admin"))
            .one(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_by_priority(
        db: &DbConn,
        priority: crate::entities::recommendations::RecommendationPriority,
    ) -> Result<Vec<recommendations::Model>, AppError> {
        Recommendations::find()
            .filter(recommendations::Column::Priority.eq(priority))
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_high_priority(db: &DbConn) -> Result<Vec<recommendations::Model>, AppError> {
        Recommendations::find()
            .filter(
                recommendations::Column::Priority
                    .eq(crate::entities::recommendations::RecommendationPriority::High),
            )
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn update_priority(
        db: &DbConn,
        recommendation_id: Uuid,
        priority: crate::entities::recommendations::RecommendationPriority,
    ) -> Result<recommendations::Model, AppError> {
        let recommendation = Self::find_by_id(db, recommendation_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Recommendation not found".to_string()))?;

        let mut active_model: recommendations::ActiveModel = recommendation.into();
        active_model.priority = Set(priority);
        active_model.updated_at = Set(chrono::Utc::now());

        active_model.update(db).await.map_err(AppError::from)
    }

    /// Find all recommendations with pagination (admin-created only)
    pub async fn find_all_paginated(
        db: &DbConn,
        page: u64,
        page_size: u64,
    ) -> Result<(Vec<recommendations::Model>, u64), AppError> {
        let paginator = Recommendations::find()
            .filter(recommendations::Column::Source.eq("admin"))
            .order_by_asc(recommendations::Column::CreatedAt)
            .paginate(db, page_size);

        let total = paginator.num_items().await?;
        let recommendations = paginator.fetch_page(page - 1).await?;

        Ok((recommendations, total))
    }

    /// Find recommendations by dimension with pagination (admin-created only)
    pub async fn find_by_dimension_paginated(
        db: &DbConn,
        dimension_id: Uuid,
        page: u64,
        page_size: u64,
    ) -> Result<(Vec<recommendations::Model>, u64), AppError> {
        let paginator = Recommendations::find()
            .filter(recommendations::Column::DimensionId.eq(dimension_id))
            .filter(recommendations::Column::Source.eq("admin"))
            .order_by_asc(recommendations::Column::CreatedAt)
            .paginate(db, page_size);

        let total = paginator.num_items().await?;
        let recommendations = paginator.fetch_page(page - 1).await?;

        Ok((recommendations, total))
    }

    /// Find all admin-created recommendations filtered by language
    pub async fn find_all_paginated_by_language(        db: &DbConn,
        page: u64,
        page_size: u64,
        language: &str,
    ) -> Result<(Vec<recommendations::Model>, u64), AppError> {
        let paginator = Recommendations::find()
            .filter(recommendations::Column::Source.eq("admin"))
            .filter(recommendations::Column::Language.eq(language))
            .order_by_asc(recommendations::Column::CreatedAt)
            .paginate(db, page_size);

        let total = paginator.num_items().await?;
        let recommendations = paginator.fetch_page(page - 1).await?;

        Ok((recommendations, total))
    }

    /// Find by dimension_key and priority for a specific language (cross-language lookup)
    pub async fn find_by_dimension_key_and_priority_and_language(
        db: &DbConn,
        dimension_key: Uuid,
        priority: &str,
        language: &str,
    ) -> Result<Option<recommendations::Model>, AppError> {
        let priority_enum = match priority {
            "Low" => crate::entities::recommendations::RecommendationPriority::Low,
            "Medium" => crate::entities::recommendations::RecommendationPriority::Medium,
            "High" => crate::entities::recommendations::RecommendationPriority::High,
            _ => return Err(AppError::ValidationError("Invalid priority".to_string())),
        };

        Recommendations::find()
            .filter(recommendations::Column::DimensionKey.eq(dimension_key))
            .filter(recommendations::Column::Priority.eq(priority_enum))
            .filter(recommendations::Column::Source.eq("admin"))
            .filter(recommendations::Column::Language.eq(language))
            .one(db)
            .await
            .map_err(AppError::from)
    }

    /// Find by dimension and priority for a specific language
    pub async fn find_by_dimension_and_priority_and_language(        db: &DbConn,
        dimension_id: Uuid,
        priority: &str,
        language: &str,
    ) -> Result<Option<recommendations::Model>, AppError> {
        let priority_enum = match priority {
            "Low" => crate::entities::recommendations::RecommendationPriority::Low,
            "Medium" => crate::entities::recommendations::RecommendationPriority::Medium,
            "High" => crate::entities::recommendations::RecommendationPriority::High,
            _ => return Err(AppError::ValidationError("Invalid priority".to_string())),
        };

        Recommendations::find()
            .filter(recommendations::Column::DimensionId.eq(dimension_id))
            .filter(recommendations::Column::Priority.eq(priority_enum))
            .filter(recommendations::Column::Source.eq("admin"))
            .filter(recommendations::Column::Language.eq(language))
            .one(db)
            .await
            .map_err(AppError::from)
    }
}
