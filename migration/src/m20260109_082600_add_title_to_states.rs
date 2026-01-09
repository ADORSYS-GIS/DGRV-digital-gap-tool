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
                    .add_column(
                        ColumnDef::new(CurrentStates::Title)
                            .string()
                            .default("".to_string()),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .add_column(
                        ColumnDef::new(DesiredStates::Title)
                            .string()
                            .default("".to_string()),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .exec_stmt(
                Query::update()
                    .table(CurrentStates::Table)
                    .values([(CurrentStates::Title, "".into())])
                    .to_owned(),
            )
            .await?;

        manager
            .exec_stmt(
                Query::update()
                    .table(DesiredStates::Table)
                    .values([(DesiredStates::Title, "".into())])
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .modify_column(ColumnDef::new(CurrentStates::Title).string().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .modify_column(ColumnDef::new(DesiredStates::Title).string().not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .drop_column(CurrentStates::Title)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .drop_column(DesiredStates::Title)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum CurrentStates {
    Table,
    Title,
}

#[derive(DeriveIden)]
enum DesiredStates {
    Table,
    Title,
}