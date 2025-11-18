use crate::entities::action_items;
use crate::error::AppError;
use sea_orm::*;

pub struct ActionItemsRepository;

impl ActionItemsRepository {
    pub async fn create(
        db: &DbConn,
        action_item_data: action_items::ActiveModel,
    ) -> Result<action_items::Model, AppError> {
        action_item_data.insert(db).await.map_err(AppError::from)
    }
}
