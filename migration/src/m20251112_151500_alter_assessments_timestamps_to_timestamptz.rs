use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .modify_column(
                        ColumnDef::new(Assessments::StartedAt)
                            .timestamp_with_time_zone(),
                    )
                    .modify_column(
                        ColumnDef::new(Assessments::CompletedAt)
                            .timestamp_with_time_zone(),
                    )
                    .modify_column(
                        ColumnDef::new(Assessments::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .modify_column(
                        ColumnDef::new(Assessments::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .modify_column(
                        ColumnDef::new(Assessments::StartedAt)
                            .timestamp(),
                    )
                    .modify_column(
                        ColumnDef::new(Assessments::CompletedAt)
                            .timestamp(),
                    )
                    .modify_column(
                        ColumnDef::new(Assessments::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .modify_column(
                        ColumnDef::new(Assessments::UpdatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum Assessments {
    Table,
    StartedAt,
    CompletedAt,
    CreatedAt,
    UpdatedAt,
}