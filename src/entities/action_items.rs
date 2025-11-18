use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "action_items")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub id: Uuid,
    pub action_plan_id: Uuid,
    pub recommendation_id: Uuid,
    pub dimension_assessment_id: Uuid,
    pub status: ActionItemStatus,
    pub priority: ActionItemPriority,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "action_item_status")]
pub enum ActionItemStatus {
    #[sea_orm(string_value = "todo")]
    Todo,
    #[sea_orm(string_value = "in_progress")]
    InProgress,
    #[sea_orm(string_value = "done")]
    Done,
    #[sea_orm(string_value = "approved")]
    Approved,
}

impl fmt::Display for ActionItemStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ActionItemStatus::Todo => write!(f, "todo"),
            ActionItemStatus::InProgress => write!(f, "in_progress"),
            ActionItemStatus::Done => write!(f, "done"),
            ActionItemStatus::Approved => write!(f, "approved"),
        }
    }
}

impl FromStr for ActionItemStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "todo" => Ok(ActionItemStatus::Todo),
            "in_progress" => Ok(ActionItemStatus::InProgress),
            "done" => Ok(ActionItemStatus::Done),
            "approved" => Ok(ActionItemStatus::Approved),
            _ => Err(format!("Invalid action item status: {s}")),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "action_item_priority"
)]
pub enum ActionItemPriority {
    #[sea_orm(string_value = "low")]
    Low,
    #[sea_orm(string_value = "medium")]
    Medium,
    #[sea_orm(string_value = "high")]
    High,
}

impl fmt::Display for ActionItemPriority {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ActionItemPriority::Low => write!(f, "low"),
            ActionItemPriority::Medium => write!(f, "medium"),
            ActionItemPriority::High => write!(f, "high"),
        }
    }
}

impl FromStr for ActionItemPriority {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "low" => Ok(ActionItemPriority::Low),
            "medium" => Ok(ActionItemPriority::Medium),
            "high" => Ok(ActionItemPriority::High),
            _ => Err(format!("Invalid action item priority: {s}")),
        }
    }
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::action_plans::Entity",
        from = "Column::ActionPlanId",
        to = "super::action_plans::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ActionPlans,
    #[sea_orm(
        belongs_to = "super::recommendations::Entity",
        from = "Column::RecommendationId",
        to = "super::recommendations::Column::RecommendationId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Recommendations,
}

impl Related<super::action_plans::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ActionPlans.def()
    }
}

impl Related<super::recommendations::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Recommendations.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
