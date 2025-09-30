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
                    .add_column_if_not_exists(
                        ColumnDef::new(Reports::MinioPath)
                            .string()
                            .null()
                            .comment("MinIO object path for stored report file")
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
                    .drop_column(Reports::MinioPath)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum Reports {
    Table,
    MinioPath,
}