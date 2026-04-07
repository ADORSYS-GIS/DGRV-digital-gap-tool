use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add source column with default 'admin' so existing recommendations are preserved
        manager
            .alter_table(
                Table::alter()
                    .table(Recommendations::Table)
                    .add_column(
                        ColumnDef::new(Recommendations::Source)
                            .string()
                            .not_null()
                            .default("admin"),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Recommendations::Table)
                    .drop_column(Recommendations::Source)
                    .to_owned(),
            )
            .await
    }
}

#[derive(Iden)]
enum Recommendations {
    Table,
    Source,
}
