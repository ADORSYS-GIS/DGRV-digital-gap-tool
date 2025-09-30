use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "dimensions")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub dimension_id: Uuid,
    #[sea_orm(unique)]
    pub name: String,
    pub description: Option<String>,
    pub weight: Option<i32>,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::current_states::Entity")]
    CurrentStates,
    #[sea_orm(has_many = "super::desired_states::Entity")]
    DesiredStates,
    #[sea_orm(has_many = "super::dimension_assessments::Entity")]
    DimensionAssessments,
    #[sea_orm(has_many = "super::gaps::Entity")]
    Gaps,
    #[sea_orm(has_many = "super::recommendations::Entity")]
    Recommendations,
}

impl Related<super::current_states::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CurrentStates.def()
    }
}

impl Related<super::desired_states::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DesiredStates.def()
    }
}

impl Related<super::dimension_assessments::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DimensionAssessments.def()
    }
}

impl Related<super::gaps::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Gaps.def()
    }
}

impl Related<super::recommendations::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Recommendations.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}