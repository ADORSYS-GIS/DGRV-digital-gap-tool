use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // 1. Add missing fields to dimensions table (align with implementation)
        manager
            .alter_table(
                Table::alter()
                    .table(Dimensions::Table)
                    .add_column_if_not_exists(ColumnDef::new(Dimensions::Category).string().null())
                    .add_column_if_not_exists(
                        ColumnDef::new(Dimensions::IsActive)
                            .boolean()
                            .null()
                            .default(true),
                    )
                    .to_owned(),
            )
            .await?;

        // 2. Add missing fields to current_states table
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .add_column_if_not_exists(ColumnDef::new(CurrentStates::Level).string().null())
                    .add_column_if_not_exists(
                        ColumnDef::new(CurrentStates::Characteristics)
                            .string()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        // 3. Add missing fields to desired_states table
        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .add_column_if_not_exists(ColumnDef::new(DesiredStates::Level).string().null())
                    .add_column_if_not_exists(
                        ColumnDef::new(DesiredStates::TargetDate)
                            .timestamp_with_time_zone()
                            .null(),
                    )
                    .add_column_if_not_exists(
                        ColumnDef::new(DesiredStates::SuccessCriteria)
                            .string()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        // 4. Restore dimension_assessments fields (CRITICAL - required by ER diagram)
        manager
            .alter_table(
                Table::alter()
                    .table(DimensionAssessments::Table)
                    .add_column_if_not_exists(
                        ColumnDef::new(DimensionAssessments::CurrentStateId)
                            .uuid()
                            .null(), // Nullable for backward compatibility with existing data
                    )
                    .add_column_if_not_exists(
                        ColumnDef::new(DimensionAssessments::DesiredStateId)
                            .uuid()
                            .null(), // Nullable for backward compatibility
                    )
                    .add_column_if_not_exists(
                        ColumnDef::new(DimensionAssessments::CurrentScore)
                            .integer()
                            .null(), // Nullable for backward compatibility
                    )
                    .add_column_if_not_exists(
                        ColumnDef::new(DimensionAssessments::DesiredScore)
                            .integer()
                            .null(), // Nullable for backward compatibility
                    )
                    .to_owned(),
            )
            .await?;

        // 5. Add foreign keys for dimension_assessments state references
        // Note: We use if_not_exists pattern by catching errors
        let _ = manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_dimension_assessments_current_states")
                    .from(
                        DimensionAssessments::Table,
                        DimensionAssessments::CurrentStateId,
                    )
                    .to(CurrentStates::Table, CurrentStates::CurrentStateId)
                    .on_delete(ForeignKeyAction::SetNull)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await;

        let _ = manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_dimension_assessments_desired_states")
                    .from(
                        DimensionAssessments::Table,
                        DimensionAssessments::DesiredStateId,
                    )
                    .to(DesiredStates::Table, DesiredStates::DesiredStateId)
                    .on_delete(ForeignKeyAction::SetNull)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await;

        // 6. Restore minio_path to reports table (as per ER diagram update)
        manager
            .alter_table(
                Table::alter()
                    .table(Reports::Table)
                    .add_column_if_not_exists(ColumnDef::new(Reports::MinioPath).string().null())
                    .to_owned(),
            )
            .await?;

        // 7. Add index for minio_path lookups
        let _ = manager
            .create_index(
                Index::create()
                    .name("idx_reports_minio_path")
                    .table(Reports::Table)
                    .col(Reports::MinioPath)
                    .to_owned(),
            )
            .await;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop index
        let _ = manager
            .drop_index(
                Index::drop()
                    .name("idx_reports_minio_path")
                    .table(Reports::Table)
                    .to_owned(),
            )
            .await;

        // Remove minio_path from reports
        manager
            .alter_table(
                Table::alter()
                    .table(Reports::Table)
                    .drop_column(Reports::MinioPath)
                    .to_owned(),
            )
            .await?;

        // Drop foreign keys
        let _ = manager
            .drop_foreign_key(
                ForeignKey::drop()
                    .name("fk_dimension_assessments_desired_states")
                    .table(DimensionAssessments::Table)
                    .to_owned(),
            )
            .await;

        let _ = manager
            .drop_foreign_key(
                ForeignKey::drop()
                    .name("fk_dimension_assessments_current_states")
                    .table(DimensionAssessments::Table)
                    .to_owned(),
            )
            .await;

        // Remove dimension_assessments fields
        manager
            .alter_table(
                Table::alter()
                    .table(DimensionAssessments::Table)
                    .drop_column(DimensionAssessments::DesiredScore)
                    .drop_column(DimensionAssessments::CurrentScore)
                    .drop_column(DimensionAssessments::DesiredStateId)
                    .drop_column(DimensionAssessments::CurrentStateId)
                    .to_owned(),
            )
            .await?;

        // Remove desired_states fields
        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .drop_column(DesiredStates::SuccessCriteria)
                    .drop_column(DesiredStates::TargetDate)
                    .drop_column(DesiredStates::Level)
                    .to_owned(),
            )
            .await?;

        // Remove current_states fields
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .drop_column(CurrentStates::Characteristics)
                    .drop_column(CurrentStates::Level)
                    .to_owned(),
            )
            .await?;

        // Remove dimensions fields
        manager
            .alter_table(
                Table::alter()
                    .table(Dimensions::Table)
                    .drop_column(Dimensions::IsActive)
                    .drop_column(Dimensions::Category)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
#[allow(dead_code)]
enum Dimensions {
    Table,
    DimensionId,
    Category,
    IsActive,
}

#[derive(DeriveIden)]
enum CurrentStates {
    Table,
    CurrentStateId,
    Level,
    Characteristics,
}

#[derive(DeriveIden)]
enum DesiredStates {
    Table,
    DesiredStateId,
    Level,
    TargetDate,
    SuccessCriteria,
}

#[derive(DeriveIden)]
#[allow(dead_code)]
enum DimensionAssessments {
    Table,
    DimensionAssessmentId,
    CurrentStateId,
    DesiredStateId,
    CurrentScore,
    DesiredScore,
}

#[derive(DeriveIden)]
#[allow(dead_code)]
enum Reports {
    Table,
    ReportId,
    MinioPath,
}
