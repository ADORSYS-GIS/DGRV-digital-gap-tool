use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "desired_states")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub desired_state_id: Uuid,
    pub dimension_id: Uuid,
    pub description: Option<String>,
    pub score: i32,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::dimensions::Entity",
        from = "Column::DimensionId",
        to = "super::dimensions::Column::DimensionId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Dimensions,
}

impl Related<super::dimensions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Dimensions.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

