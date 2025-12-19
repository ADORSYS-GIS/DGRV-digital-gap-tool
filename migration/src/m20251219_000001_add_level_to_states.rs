use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .add_column(ColumnDef::new(CurrentStates::Level).string().null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .add_column(ColumnDef::new(DesiredStates::Level).string().null())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .drop_column(CurrentStates::Level)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .drop_column(DesiredStates::Level)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum CurrentStates {
    Table,
    Level,
}

#[derive(DeriveIden)]
enum DesiredStates {
    Table,
    Level,
}