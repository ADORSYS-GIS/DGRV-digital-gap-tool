use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(DimensionAssessments::Table)
                    .add_column(
                        ColumnDef::new(DimensionAssessments::GapScore)
                            .integer()
                            .not_null(),
                    )
                    .drop_column(Alias::new("current_score"))
                    .drop_column(Alias::new("desired_score"))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(DimensionAssessments::Table)
                    .drop_column(Alias::new("gap_score"))
                    .add_column(
                        ColumnDef::new(Alias::new("current_score"))
                            .integer()
                            .not_null(),
                    )
                    .add_column(
                        ColumnDef::new(Alias::new("desired_score"))
                            .integer()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum DimensionAssessments {
    Table,
    GapScore,
}
