use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "assessment_recommendations")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub assessment_recommendation_id: Uuid,
    pub assessment_id: Uuid,
    pub recommendation_id: Uuid,
    pub gap_value: i32,
    pub custom_notes: Option<String>,
    pub implementation_status: ImplementationStatus,
    pub selected_at: Option<DateTimeUtc>,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "implementation_status")]
pub enum ImplementationStatus {
    #[sea_orm(string_value = "planned")]
    Planned,
    #[sea_orm(string_value = "in_progress")]
    InProgress,
    #[sea_orm(string_value = "completed")]
    Completed,
    #[sea_orm(string_value = "cancelled")]
    Cancelled,
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
        belongs_to = "super::recommendations::Entity",
        from = "Column::RecommendationId",
        to = "super::recommendations::Column::RecommendationId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Recommendations,
}

impl Related<super::assessments::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Assessments.def()
    }
}

impl Related<super::recommendations::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Recommendations.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}