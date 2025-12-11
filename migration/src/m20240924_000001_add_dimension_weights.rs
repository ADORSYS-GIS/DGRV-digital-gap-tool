use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Dimensions::Table)
                    .add_column(
                        ColumnDef::new(Dimensions::Weight)
                            .integer()
                            .null()
                            .check(Expr::col(Dimensions::Weight).between(0, 100)),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Dimensions::Table)
                    .drop_column(Dimensions::Weight)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Dimensions {
    Table,
    Weight,
}
