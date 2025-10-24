use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::str::FromStr;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "assessments")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub assessment_id: Uuid,
    pub user_id: String,
    pub organization_id: String,
    pub cooperative_id: String,
    pub document_title: String,
    pub status: AssessmentStatus,
    pub started_at: Option<DateTimeUtc>,
    pub completed_at: Option<DateTimeUtc>,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
    pub metadata: Option<JsonValue>,
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "assessment_status")]
pub enum AssessmentStatus {
    #[sea_orm(string_value = "draft")]
    Draft,
    #[sea_orm(string_value = "in_progress")]
    InProgress,
    #[sea_orm(string_value = "completed")]
    Completed,
    #[sea_orm(string_value = "archived")]
    Archived,
}

impl FromStr for AssessmentStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "draft" => Ok(AssessmentStatus::Draft),
            "in_progress" => Ok(AssessmentStatus::InProgress),
            "completed" => Ok(AssessmentStatus::Completed),
            "archived" => Ok(AssessmentStatus::Archived),
            _ => Err(format!("Invalid assessment status: {}", s)),
        }
    }
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::dimension_assessments::Entity")]
    DimensionAssessments,
    #[sea_orm(has_many = "super::reports::Entity")]
    Reports,
    #[sea_orm(has_many = "super::action_plans::Entity")]
    ActionPlans,
    #[sea_orm(has_many = "super::assessment_recommendations::Entity")]
    AssessmentRecommendations,
}

impl Related<super::dimension_assessments::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DimensionAssessments.def()
    }
}

impl Related<super::reports::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Reports.def()
    }
}

impl Related<super::action_plans::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ActionPlans.def()
    }
}

impl Related<super::assessment_recommendations::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AssessmentRecommendations.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}