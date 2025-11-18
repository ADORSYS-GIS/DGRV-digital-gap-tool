use sea_orm_migration::prelude::*;
use sea_orm_migration::prelude::extension::postgres::Type;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create the new, streamlined action_plans table
        manager
            .create_table(
                Table::create()
                    .table(ActionPlans::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(ActionPlans::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(ActionPlans::AssessmentId).uuid().not_null())
                    .col(ColumnDef::new(ActionPlans::CreatedAt).timestamp_with_time_zone().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(ActionPlans::UpdatedAt).timestamp_with_time_zone().not_null().default(Expr::current_timestamp()))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_action_plans_assessment_id")
                            .from(ActionPlans::Table, ActionPlans::AssessmentId)
                            .to(Assessments::Table, Assessments::AssessmentId)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Define and create the ActionItemStatus enum
        manager
            .create_type(
                Type::create()
                    .as_enum(ActionItemStatus::Table)
                    .values([
                        ActionItemStatus::Todo,
                        ActionItemStatus::InProgress,
                        ActionItemStatus::Done,
                        ActionItemStatus::Approved,
                    ])
                    .to_owned(),
            )
            .await?;

        // Define and create the ActionItemPriority enum
        manager
            .create_type(
                Type::create()
                    .as_enum(ActionItemPriority::Table)
                    .values([
                        ActionItemPriority::Low,
                        ActionItemPriority::Medium,
                        ActionItemPriority::High,
                    ])
                    .to_owned(),
            )
            .await?;

        // Create the new, streamlined action_items table
        manager
            .create_table(
                Table::create()
                    .table(ActionItems::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(ActionItems::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(ActionItems::ActionPlanId).uuid().not_null())
                    .col(ColumnDef::new(ActionItems::DimensionAssessmentId).uuid().not_null())
                    .col(ColumnDef::new(ActionItems::RecommendationId).uuid().not_null())
                    .col(
                        ColumnDef::new(ActionItems::Status)
                            .enumeration(
                                ActionItemStatus::Table,
                                [
                                    ActionItemStatus::Todo,
                                    ActionItemStatus::InProgress,
                                    ActionItemStatus::Done,
                                    ActionItemStatus::Approved,
                                ],
                            )
                            .not_null()
                            .default(Value::String(Some(Box::new("todo".to_owned())))),
                    )
                    .col(
                        ColumnDef::new(ActionItems::Priority)
                            .enumeration(
                                ActionItemPriority::Table,
                                [
                                    ActionItemPriority::Low,
                                    ActionItemPriority::Medium,
                                    ActionItemPriority::High,
                                ],
                            )
                            .not_null()
                            .default(Value::String(Some(Box::new("medium".to_owned())))),
                    )
                    .col(ColumnDef::new(ActionItems::CreatedAt).timestamp_with_time_zone().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(ActionItems::UpdatedAt).timestamp_with_time_zone().not_null().default(Expr::current_timestamp()))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_action_items_action_plan_id")
                            .from(ActionItems::Table, ActionItems::ActionPlanId)
                            .to(ActionPlans::Table, ActionPlans::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_action_items_dimension_assessment_id")
                            .from(ActionItems::Table, ActionItems::DimensionAssessmentId)
                            .to(DimensionAssessments::Table, DimensionAssessments::DimensionAssessmentId)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_action_items_recommendation_id")
                            .from(ActionItems::Table, ActionItems::RecommendationId)
                            .to(Recommendations::Table, Recommendations::RecommendationId)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop the tables in reverse order of creation to respect foreign key constraints.
        manager
            .drop_table(Table::drop().table(ActionItems::Table).if_exists().to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(ActionPlans::Table).if_exists().to_owned())
            .await?;

        // Drop the enum types
        manager
            .drop_type(Type::drop().name(ActionItemStatus::Table).if_exists().to_owned())
            .await?;
        manager
            .drop_type(Type::drop().name(ActionItemPriority::Table).if_exists().to_owned())
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum ActionPlans {
    Table,
    Id,
    AssessmentId,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum ActionItems {
    Table,
    Id,
    ActionPlanId,
    DimensionAssessmentId,
    RecommendationId,
    Status,
    Priority,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum ActionItemStatus {
    Table,
    Todo,
    InProgress,
    Done,
    Approved,
}

#[derive(DeriveIden)]
enum ActionItemPriority {
    Table,
    Low,
    Medium,
    High,
}

#[derive(DeriveIden)]
enum Assessments {
    Table,
    AssessmentId,
}

#[derive(DeriveIden)]
enum DimensionAssessments {
    Table,
    DimensionAssessmentId,
}

#[derive(DeriveIden)]
enum Recommendations {
    Table,
    RecommendationId,
}