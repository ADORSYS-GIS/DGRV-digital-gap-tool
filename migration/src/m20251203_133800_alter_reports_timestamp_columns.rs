use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Reports::Table)
                    .modify_column(ColumnDef::new(Reports::GeneratedAt).timestamp_with_time_zone())
                    .modify_column(
                        ColumnDef::new(Reports::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .modify_column(
                        ColumnDef::new(Reports::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Reports::Table)
                    .modify_column(ColumnDef::new(Reports::GeneratedAt).timestamp())
                    .modify_column(ColumnDef::new(Reports::CreatedAt).timestamp().not_null())
                    .modify_column(ColumnDef::new(Reports::UpdatedAt).timestamp().not_null())
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum Reports {
    Table,
    GeneratedAt,
    CreatedAt,
    UpdatedAt,
}
