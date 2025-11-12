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
                    .drop_column(CurrentStates::Title)
                    .drop_column(CurrentStates::Characteristics)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .drop_column(DesiredStates::Title)
                    .drop_column(DesiredStates::SuccessCriteria)
                    .drop_column(DesiredStates::TargetDate)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .add_column(ColumnDef::new(CurrentStates::Title).string().not_null())
                    .add_column(ColumnDef::new(CurrentStates::Characteristics).string())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .add_column(ColumnDef::new(DesiredStates::Title).string().not_null())
                    .add_column(ColumnDef::new(DesiredStates::SuccessCriteria).string())
                    .add_column(ColumnDef::new(DesiredStates::TargetDate).timestamp())
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum CurrentStates {
    Table,
    Title,
    Characteristics,
}

#[derive(DeriveIden)]
enum DesiredStates {
    Table,
    Title,
    SuccessCriteria,
    TargetDate,
}
