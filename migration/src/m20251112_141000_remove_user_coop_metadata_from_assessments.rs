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
                    .drop_column(Assessments::UserId)
                    .drop_column(Assessments::CooperativeId)
                    .drop_column(Assessments::Metadata)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .add_column(ColumnDef::new(Assessments::UserId).string())
                    .add_column(ColumnDef::new(Assessments::CooperativeId).string())
                    .add_column(ColumnDef::new(Assessments::Metadata).json())
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum Assessments {
    Table,
    UserId,
    CooperativeId,
    Metadata,
}