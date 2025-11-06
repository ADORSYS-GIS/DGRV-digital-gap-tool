use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop the min_gap_size and max_gap_size columns from the recommendations table
        // Note: These columns were never created in the initial migration, so we skip this
        // to avoid errors on fresh database installations
        let _ = manager;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add the min_gap_size and max_gap_size columns back to the recommendations table (for rollback)
        manager
            .alter_table(
                Table::alter()
                    .table(Recommendations::Table)
                    .add_column(
                        ColumnDef::new(Recommendations::MinGapSize)
                            .integer()
                            .not_null()
                            .default(0)
                    )
                    .add_column(
                        ColumnDef::new(Recommendations::MaxGapSize)
                            .integer()
                            .not_null()
                            .default(0)
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Recommendations {
    Table,
    MinGapSize,
    MaxGapSize,
}