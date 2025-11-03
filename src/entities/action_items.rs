use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;
use std::str::FromStr;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "action_items")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub action_item_id: Uuid,
    pub action_plan_id: Uuid,
    pub recommendation_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub status: ActionItemStatus,
    pub priority: ActionItemPriority,
    pub estimated_effort_hours: Option<i32>,
    pub estimated_cost: Option<Decimal>,
    pub target_date: Option<DateTimeUtc>,
    pub completed_date: Option<DateTimeUtc>,
    pub assigned_to: Option<String>,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "action_item_status")]
pub enum ActionItemStatus {
    #[sea_orm(string_value = "pending")]
    Pending,
    #[sea_orm(string_value = "in_progress")]
    InProgress,
    #[sea_orm(string_value = "completed")]
    Completed,
    #[sea_orm(string_value = "cancelled")]
    Cancelled,
}

impl FromStr for ActionItemStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "pending" => Ok(ActionItemStatus::Pending),
            "in_progress" => Ok(ActionItemStatus::InProgress),
            "completed" => Ok(ActionItemStatus::Completed),
            "cancelled" => Ok(ActionItemStatus::Cancelled),
            _ => Err(format!("Invalid action item status: {}", s)),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "action_item_priority")]
pub enum ActionItemPriority {
    #[sea_orm(string_value = "low")]
    Low,
    #[sea_orm(string_value = "medium")]
    Medium,
    #[sea_orm(string_value = "high")]
    High,
    #[sea_orm(string_value = "urgent")]
    Urgent,
}

impl FromStr for ActionItemPriority {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "low" => Ok(ActionItemPriority::Low),
            "medium" => Ok(ActionItemPriority::Medium),
            "high" => Ok(ActionItemPriority::High),
            "urgent" => Ok(ActionItemPriority::Urgent),
            _ => Err(format!("Invalid action item priority: {}", s)),
        }
    }
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::action_plans::Entity",
        from = "Column::ActionPlanId",
        to = "super::action_plans::Column::ActionPlanId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ActionPlans,
    #[sea_orm(
        belongs_to = "super::recommendations::Entity",
        from = "Column::RecommendationId",
        to = "super::recommendations::Column::RecommendationId",
        on_update = "Cascade",
        on_delete = "SetNull"
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