use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "action_plans")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub id: Uuid,
    pub assessment_id: Uuid,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::assessments::Entity",
        from = "Column::AssessmentId",
        to = "super::assessments::Column::AssessmentId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Assessments,
    #[sea_orm(has_many = "super::action_items::Entity")]
    ActionItems,
}

impl Related<super::assessments::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Assessments.def()
    }
}

impl Related<super::action_items::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ActionItems.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
