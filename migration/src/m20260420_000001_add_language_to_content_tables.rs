use sea_orm_migration::prelude::*;

/// Adds a `language` column (VARCHAR 10, NOT NULL, DEFAULT 'en') to the four
/// admin-configurable content tables: dimensions, current_states, desired_states,
/// recommendations, and gaps.
///
/// Existing rows automatically get language = 'en' via the column default.
#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // dimensions
        manager
            .alter_table(
                Table::alter()
                    .table(Dimensions::Table)
                    .add_column(
                        ColumnDef::new(Dimensions::Language)
                            .string_len(10)
                            .not_null()
                            .default("en"),
                    )
                    .to_owned(),
            )
            .await?;

        // current_states
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .add_column(
                        ColumnDef::new(CurrentStates::Language)
                            .string_len(10)
                            .not_null()
                            .default("en"),
                    )
                    .to_owned(),
            )
            .await?;

        // desired_states
        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .add_column(
                        ColumnDef::new(DesiredStates::Language)
                            .string_len(10)
                            .not_null()
                            .default("en"),
                    )
                    .to_owned(),
            )
            .await?;

        // recommendations
        manager
            .alter_table(
                Table::alter()
                    .table(Recommendations::Table)
                    .add_column(
                        ColumnDef::new(Recommendations::Language)
                            .string_len(10)
                            .not_null()
                            .default("en"),
                    )
                    .to_owned(),
            )
            .await?;

        // gaps
        manager
            .alter_table(
                Table::alter()
                    .table(Gaps::Table)
                    .add_column(
                        ColumnDef::new(Gaps::Language)
                            .string_len(10)
                            .not_null()
                            .default("en"),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Dimensions::Table)
                    .drop_column(Dimensions::Language)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .drop_column(CurrentStates::Language)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .drop_column(DesiredStates::Language)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Recommendations::Table)
                    .drop_column(Recommendations::Language)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Gaps::Table)
                    .drop_column(Gaps::Language)
                    .to_owned(),
            )
            .await
    }
}

#[derive(Iden)]
enum Dimensions {
    Table,
    Language,
}

#[derive(Iden)]
enum CurrentStates {
    Table,
    Language,
}

#[derive(Iden)]
enum DesiredStates {
    Table,
    Language,
}

#[derive(Iden)]
enum Recommendations {
    Table,
    Language,
}

#[derive(Iden)]
enum Gaps {
    Table,
    Language,
}
