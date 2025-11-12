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
    pub gap_score: i32,
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


impl ActiveModelBehavior for ActiveModel {}
