use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add `coop_id` to `assessments` table
        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .add_column(
                        ColumnDef::new(Assessments::CooperationId)
                            .string()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        // Add `org_id` and `coop_id` to `dimension_assessments` table
        manager
            .alter_table(
                Table::alter()
                    .table(DimensionAssessments::Table)
                    .add_column(
                        ColumnDef::new(DimensionAssessments::OrganizationId)
                            .string()
                            .null(), // Initially allow nulls
                    )
                    .add_column(
                        ColumnDef::new(DimensionAssessments::CooperationId)
                            .string()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        // Populate the new `organization_id` column with a default value
        manager
            .get_connection()
            .execute_unprepared(
                "UPDATE \"dimension_assessments\" SET \"organization_id\" = 'default-org-id' WHERE \"organization_id\" IS NULL",
            )
            .await?;

        // Alter the `organization_id` column to be NOT NULL
        manager
            .alter_table(
                Table::alter()
                    .table(DimensionAssessments::Table)
                    .modify_column(
                        ColumnDef::new(DimensionAssessments::OrganizationId)
                            .string()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Remove `coop_id` from `assessments` table
        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .drop_column(Assessments::CooperationId)
                    .to_owned(),
            )
            .await?;

        // Remove `org_id` and `coop_id` from `dimension_assessments` table
        manager
            .alter_table(
                Table::alter()
                    .table(DimensionAssessments::Table)
                    .drop_column(DimensionAssessments::OrganizationId)
                    .drop_column(DimensionAssessments::CooperationId)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum Assessments {
    Table,
    CooperationId,
}

#[derive(DeriveIden)]
enum DimensionAssessments {
    Table,
    OrganizationId,
    CooperationId,
}