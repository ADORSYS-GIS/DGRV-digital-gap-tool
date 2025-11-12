use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop the is_selected column from the assessment_recommendations table
        // Note: This column was never created in the initial migration, so we skip this
        // to avoid errors on fresh database installations
        let _ = manager;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add the is_selected column back to the assessment_recommendations table (for rollback)
        manager
            .alter_table(
                Table::alter()
                    .table(AssessmentRecommendations::Table)
                    .add_column(
                        ColumnDef::new(AssessmentRecommendations::IsSelected)
                            .boolean()
                            .not_null()
                            .default(false)
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum AssessmentRecommendations {
    Table,
    IsSelected,
}