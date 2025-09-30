use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop the ease_and_impact column from the gaps table
        manager
            .alter_table(
                Table::alter()
                    .table(Gaps::Table)
                    .drop_column(Gaps::EaseAndImpact)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add the ease_and_impact column back to the gaps table (for rollback)
        manager
            .alter_table(
                Table::alter()
                    .table(Gaps::Table)
                    .add_column(
                        ColumnDef::new(Gaps::EaseAndImpact)
                            .boolean()
                            .null()
                    )
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