use sea_orm_migration::prelude::extension::postgres::Type;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create assessment_status enum
        manager
            .create_type(
                Type::create()
                    .as_enum(AssessmentStatus::AssessmentStatusEnum)
                    .values([
                        AssessmentStatus::Draft,
                        AssessmentStatus::InProgress,
                        AssessmentStatus::Completed,
                        AssessmentStatus::Archived,
                    ])
                    .to_owned(),
            )
            .await?;

        manager
            .get_connection()
            .execute_unprepared("ALTER TABLE \"assessments\" ALTER COLUMN \"status\" DROP DEFAULT")
            .await?;

        manager
            .get_connection()
            .execute_unprepared(
                "ALTER TABLE \"assessments\" ALTER COLUMN \"status\" TYPE assessment_status_enum USING \"status\"::text::assessment_status_enum",
            )
            .await?;

        manager
            .get_connection()
            .execute_unprepared("ALTER TABLE \"assessments\" ALTER COLUMN \"status\" SET NOT NULL")
            .await?;

        manager
            .get_connection()
            .execute_unprepared(
                "ALTER TABLE \"assessments\" ALTER COLUMN \"status\" SET DEFAULT 'draft'::assessment_status_enum",
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .get_connection()
            .execute_unprepared("ALTER TABLE \"assessments\" ALTER COLUMN \"status\" DROP DEFAULT")
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .modify_column(ColumnDef::new(Assessments::Status).string().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .drop_type(
                Type::drop()
                    .name(AssessmentStatus::AssessmentStatusEnum)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum Assessments {
    Table,
    Status,
}

#[derive(DeriveIden)]
enum AssessmentStatus {
    AssessmentStatusEnum,
    Draft,
    InProgress,
    Completed,
    Archived,
}
