use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop the ease_and_impact column from the gaps table
        // Note: This column was never created in the initial migration, so we skip this
        // to avoid errors on fresh database installations
        let _ = manager;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add the ease_and_impact column back to the gaps table (for rollback)
        manager
            .alter_table(
                Table::alter()
                    .table(Gaps::Table)
                    .add_column(ColumnDef::new(Gaps::EaseAndImpact).boolean().null())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Gaps {
    Table,
    EaseAndImpact,
}
