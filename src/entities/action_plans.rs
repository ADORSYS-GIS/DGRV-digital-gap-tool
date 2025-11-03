use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use super::action_items::ActionItemPriority;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "action_plans")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub action_plan_id: Uuid,
    pub assessment_id: Uuid,
    pub report_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub status: ActionPlanStatus,
    pub target_completion_date: Option<DateTimeUtc>,
    pub priority: ActionItemPriority,
    pub estimated_budget: Option<rust_decimal::Decimal>,
    pub responsible_person: Option<String>,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "action_plan_status")]
pub enum ActionPlanStatus {
    #[sea_orm(string_value = "draft")]
    Draft,
    #[sea_orm(string_value = "active")]
    Active,
    #[sea_orm(string_value = "completed")]
    Completed,
    #[sea_orm(string_value = "cancelled")]
    Cancelled,
}

impl FromStr for ActionPlanStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "draft" => Ok(ActionPlanStatus::Draft),
            "active" => Ok(ActionPlanStatus::Active),
            "completed" => Ok(ActionPlanStatus::Completed),
            "cancelled" => Ok(ActionPlanStatus::Cancelled),
            _ => Err(format!("Invalid action plan status: {}", s)),
        }
    }
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
        belongs_to = "super::reports::Entity",
        from = "Column::ReportId",
        to = "super::reports::Column::ReportId",
        on_update = "Cascade",
        on_delete = "SetNull"
    )]
    Reports,
    #[sea_orm(has_many = "super::action_items::Entity")]
    ActionItems,
}

impl Related<super::assessments::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Assessments.def()
    }
}

impl Related<super::reports::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Reports.def()
    }
}

impl Related<super::action_items::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ActionItems.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}