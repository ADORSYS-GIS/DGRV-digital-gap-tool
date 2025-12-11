use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop tables. The SchemaManager will handle dropping foreign key constraints implicitly.
        manager
            .drop_table(
                Table::drop()
                    .table(ActionItems::Table)
                    .if_exists()
                    .to_owned(),
            )
            .await?;

        manager
            .drop_table(
                Table::drop()
                    .table(ActionPlans::Table)
                    .if_exists()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Re-create the tables and foreign keys exactly as they were before this migration.
        // This logic is copied from the original creation migration for a perfect rollback.

        // Create action_plans table
        manager
            .create_table(
                Table::create()
                    .table(ActionPlans::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ActionPlans::ActionPlanId)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(ActionPlans::AssessmentId).uuid().not_null())
                    .col(ColumnDef::new(ActionPlans::ReportId).uuid())
                    .col(ColumnDef::new(ActionPlans::Title).string().not_null())
                    .col(ColumnDef::new(ActionPlans::Description).text())
                    .col(
                        ColumnDef::new(ActionPlans::Status)
                            .string()
                            .not_null()
                            .default("draft"),
                    )
                    .col(ColumnDef::new(ActionPlans::TargetCompletionDate).timestamp())
                    .col(
                        ColumnDef::new(ActionPlans::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(ActionPlans::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Create action_items table
        manager
            .create_table(
                Table::create()
                    .table(ActionItems::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ActionItems::ActionItemId)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(ActionItems::ActionPlanId).uuid().not_null())
                    .col(ColumnDef::new(ActionItems::RecommendationId).uuid())
                    .col(ColumnDef::new(ActionItems::Title).string().not_null())
                    .col(ColumnDef::new(ActionItems::Description).text())
                    .col(
                        ColumnDef::new(ActionItems::Status)
                            .string()
                            .not_null()
                            .default("pending"),
                    )
                    .col(
                        ColumnDef::new(ActionItems::Priority)
                            .string()
                            .not_null()
                            .default("medium"),
                    )
                    .col(ColumnDef::new(ActionItems::EstimatedEffortHours).integer())
                    .col(ColumnDef::new(ActionItems::EstimatedCost).decimal())
                    .col(ColumnDef::new(ActionItems::TargetDate).timestamp())
                    .col(ColumnDef::new(ActionItems::CompletedDate).timestamp())
                    .col(ColumnDef::new(ActionItems::AssignedTo).string())
                    .col(
                        ColumnDef::new(ActionItems::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(ActionItems::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Add foreign keys for action_plans table
        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_action_plans_assessments")
                    .from(ActionPlans::Table, ActionPlans::AssessmentId)
                    .to(Assessments::Table, Assessments::AssessmentId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_action_plans_reports")
                    .from(ActionPlans::Table, ActionPlans::ReportId)
                    .to(Reports::Table, Reports::ReportId)
                    .on_delete(ForeignKeyAction::SetNull)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        // Add foreign keys for action_items table
        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_action_items_action_plans")
                    .from(ActionItems::Table, ActionItems::ActionPlanId)
                    .to(ActionPlans::Table, ActionPlans::ActionPlanId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_action_items_recommendations")
                    .from(ActionItems::Table, ActionItems::RecommendationId)
                    .to(Recommendations::Table, Recommendations::RecommendationId)
                    .on_delete(ForeignKeyAction::SetNull)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum ActionPlans {
    Table,
    ActionPlanId,
    AssessmentId,
    ReportId,
    Title,
    Description,
    Status,
    TargetCompletionDate,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum ActionItems {
    Table,
    ActionItemId,
    ActionPlanId,
    RecommendationId,
    Title,
    Description,
    Status,
    Priority,
    EstimatedEffortHours,
    EstimatedCost,
    TargetDate,
    CompletedDate,
    AssignedTo,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Assessments {
    Table,
    AssessmentId,
}

#[derive(DeriveIden)]
enum Reports {
    Table,
    ReportId,
}

#[derive(DeriveIden)]
enum Recommendations {
    Table,
    RecommendationId,
}
