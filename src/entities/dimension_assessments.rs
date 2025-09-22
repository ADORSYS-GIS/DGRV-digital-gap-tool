use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "dimension_assessments")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub dimension_assessment_id: Uuid,
    pub assessment_id: Uuid,
    pub dimension_id: Uuid,
    pub current_state_id: Uuid,
    pub desired_state_id: Uuid,
    pub current_score: i32,
    pub desired_score: i32,
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
    #[sea_orm(
        belongs_to = "super::dimensions::Entity",
        from = "Column::DimensionId",
        to = "super::dimensions::Column::DimensionId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Dimensions,
    #[sea_orm(
        belongs_to = "super::current_states::Entity",
        from = "Column::CurrentStateId",
        to = "super::current_states::Column::CurrentStateId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    CurrentStates,
    #[sea_orm(
        belongs_to = "super::desired_states::Entity",
        from = "Column::DesiredStateId",
        to = "super::desired_states::Column::DesiredStateId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    DesiredStates,
    #[sea_orm(has_one = "super::gaps::Entity")]
    Gaps,
}

impl Related<super::assessments::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Assessments.def()
    }
}

impl Related<super::dimensions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Dimensions.def()
    }
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

impl Related<super::gaps::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Gaps.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}