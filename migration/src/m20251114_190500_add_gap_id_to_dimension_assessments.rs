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
                        ColumnDef::new(DimensionAssessments::GapId)
                            .uuid()
                            .not_null(),
                    )
                    .add_foreign_key(
                        TableForeignKey::new()
                            .name("fk_dimension_assessments_gap_id")
                            .from_tbl(DimensionAssessments::Table)
                            .from_col(DimensionAssessments::GapId)
                            .to_tbl(Gaps::Table)
                            .to_col(Gaps::GapId)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(DimensionAssessments::Table)
                    .drop_foreign_key(Alias::new("fk_dimension_assessments_gap_id"))
                    .drop_column(DimensionAssessments::GapId)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum DimensionAssessments {
    Table,
    GapId,
}

#[derive(DeriveIden)]
enum Gaps {
    Table,
    GapId,
}
