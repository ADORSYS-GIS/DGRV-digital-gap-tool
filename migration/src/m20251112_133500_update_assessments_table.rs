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
                    .add_column(ColumnDef::new(Assessments::DimensionsId).json().null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .modify_column(ColumnDef::new(Assessments::UserId).string().null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .modify_column(ColumnDef::new(Assessments::CooperativeId).string().null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .drop_column(Assessments::DimensionsId)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .modify_column(ColumnDef::new(Assessments::UserId).string().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .modify_column(ColumnDef::new(Assessments::CooperativeId).string().not_null())
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum Assessments {
    Table,
    DimensionsId,
    UserId,
    CooperativeId,
}