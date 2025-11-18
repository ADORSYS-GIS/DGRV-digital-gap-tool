use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(ActionItems::Table)
                    .add_column(
                        ColumnDef::new(ActionItems::DimensionAssessmentId)
                            .uuid()
                            .not_null(),
                    )
                    .add_foreign_key(
                        TableForeignKey::new()
                            .name("fk_action_items_dimension_assessment_id")
                            .from_tbl(ActionItems::Table)
                            .from_col(ActionItems::DimensionAssessmentId)
                            .to_tbl(DimensionAssessments::Table)
                            .to_col(DimensionAssessments::DimensionAssessmentId)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(ActionItems::Table)
                    .drop_foreign_key(Alias::new("fk_action_items_dimension_assessment_id"))
                    .drop_column(ActionItems::DimensionAssessmentId)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum ActionItems {
    Table,
    DimensionAssessmentId,
}

#[derive(DeriveIden)]
enum DimensionAssessments {
    Table,
    DimensionAssessmentId,
}
