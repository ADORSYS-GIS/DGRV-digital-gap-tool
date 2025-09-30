use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "recommendations")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub recommendation_id: Uuid,
    pub dimension_id: Uuid,
    pub gap_severity: GapSeverity,
    pub priority: RecommendationPriority,
    pub description: String,
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

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "recommendation_priority")]
pub enum RecommendationPriority {
    #[sea_orm(string_value = "URGENT")]
    Urgent,
    #[sea_orm(string_value = "HIGH")]
    High,
    #[sea_orm(string_value = "MEDIUM")]
    Medium,
    #[sea_orm(string_value = "LOW")]
    Low,
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
    #[sea_orm(has_many = "super::assessment_recommendations::Entity")]
    AssessmentRecommendations,
    #[sea_orm(has_many = "super::action_items::Entity")]
    ActionItems,
}

impl Related<super::dimensions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Dimensions.def()
    }
}

impl Related<super::assessment_recommendations::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AssessmentRecommendations.def()
    }
}

impl Related<super::action_items::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ActionItems.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}