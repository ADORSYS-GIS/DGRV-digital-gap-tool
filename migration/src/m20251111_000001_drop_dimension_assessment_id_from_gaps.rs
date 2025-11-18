use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let conn = manager.get_connection();
        // Use IF EXISTS to avoid errors that abort the transaction
        conn.execute_unprepared(
            "ALTER TABLE \"gaps\" DROP CONSTRAINT IF EXISTS \"fk_gaps_dimension_assessments\"",
        )
        .await?;

        conn.execute_unprepared(
            "DROP INDEX IF EXISTS \"idx_gaps_dimension_assessment_id\"",
        )
        .await?;

        conn.execute_unprepared(
            "ALTER TABLE \"gaps\" DROP COLUMN IF EXISTS \"dimension_assessment_id\"",
        )
        .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Recreate the column as nullable for safe rollback, then recreate FK (if tables exist)
        manager
            .alter_table(
                Table::alter()
                    .table(Gaps::Table)
                    .add_column(
                        ColumnDef::new(Gaps::DimensionAssessmentId)
                            .uuid()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        let _ = manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_gaps_dimension_assessments")
                    .from(Gaps::Table, Gaps::DimensionAssessmentId)
                    .to(DimensionAssessments::Table, DimensionAssessments::DimensionAssessmentId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Gaps {
    Table,
    DimensionAssessmentId,
}

#[derive(DeriveIden)]
enum DimensionAssessments {
    Table,
    DimensionAssessmentId,
}
