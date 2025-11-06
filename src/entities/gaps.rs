use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "gaps")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub gap_id: Uuid,
    pub dimension_assessment_id: Uuid,
    pub dimension_id: Uuid,
    pub gap_size: i32,
    pub gap_severity: GapSeverity,
    pub gap_description: Option<String>,
    pub calculated_at: DateTimeUtc,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "gap_severity")]
pub enum GapSeverity {
    #[sea_orm(string_value = "LOW")]
    Low,
    #[sea_orm(string_value = "MEDIUM")]
    Medium,
    #[sea_orm(string_value = "HIGH")]
    High,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::dimension_assessments::Entity",
        from = "Column::DimensionAssessmentId",
        to = "super::dimension_assessments::Column::DimensionAssessmentId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    DimensionAssessments,
    #[sea_orm(
        belongs_to = "super::dimensions::Entity",
        from = "Column::DimensionId",
        to = "super::dimensions::Column::DimensionId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Dimensions,
}

impl Related<super::dimension_assessments::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DimensionAssessments.def()
    }
}

impl Related<super::dimensions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Dimensions.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
