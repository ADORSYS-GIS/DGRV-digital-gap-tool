use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // assessments: add cooperative_id, make document_title not null, drop deprecated columns
        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .add_column_if_not_exists(ColumnDef::new(Assessments::CooperativeId).string().not_null())
                    .modify_column(
                        ColumnDef::new(Assessments::DocumentTitle)
                            .string()
                            .not_null(),
                    )
                    .drop_column(Assessments::FileName)
                    .drop_column(Assessments::OverallScore)
                    .drop_column(Assessments::ExpectedCompletionDate)
                    .to_owned(),
            )
            .await?;

        // dimension_assessments: drop state and score columns
        manager
            .alter_table(
                Table::alter()
                    .table(DimensionAssessments::Table)
                    .drop_column(DimensionAssessments::CurrentStateId)
                    .drop_column(DimensionAssessments::DesiredStateId)
                    .drop_column(DimensionAssessments::CurrentScore)
                    .drop_column(DimensionAssessments::DesiredScore)
                    .drop_column(DimensionAssessments::Notes)
                    .to_owned(),
            )
            .await?;

        // reports: drop minio_path
        manager
            .alter_table(
                Table::alter()
                    .table(Reports::Table)
                    .drop_column(Reports::MinioPath)
                    .to_owned(),
            )
            .await?;

        // organisation_dimension: create table
        manager
            .create_table(
                Table::create()
                    .table(OrganisationDimension::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(OrganisationDimension::OrganisationDimension)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(OrganisationDimension::OrganisationId).string().not_null())
                    .col(ColumnDef::new(OrganisationDimension::DimensionId).uuid().not_null())
                    .col(ColumnDef::new(OrganisationDimension::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(OrganisationDimension::UpdatedAt).timestamp_with_time_zone().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_org_dim_dimension")
                            .from(OrganisationDimension::Table, OrganisationDimension::DimensionId)
                            .to(Dimensions::Table, Dimensions::DimensionId)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .index(
                        Index::create()
                            .name("uk_org_dim_unique")
                            .col(OrganisationDimension::OrganisationId)
                            .col(OrganisationDimension::DimensionId)
                            .unique(),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop organisation_dimension
        manager
            .drop_table(Table::drop().table(OrganisationDimension::Table).to_owned())
            .await?;

        // reports: add minio_path back
        manager
            .alter_table(
                Table::alter()
                    .table(Reports::Table)
                    .add_column(ColumnDef::new(Reports::MinioPath).string().null())
                    .to_owned(),
            )
            .await?;

        // dimension_assessments: re-add dropped columns
        manager
            .alter_table(
                Table::alter()
                    .table(DimensionAssessments::Table)
                    .add_column(ColumnDef::new(DimensionAssessments::CurrentStateId).uuid().not_null())
                    .add_column(ColumnDef::new(DimensionAssessments::DesiredStateId).uuid().not_null())
                    .add_column(ColumnDef::new(DimensionAssessments::CurrentScore).integer().not_null())
                    .add_column(ColumnDef::new(DimensionAssessments::DesiredScore).integer().not_null())
                    .add_column(ColumnDef::new(DimensionAssessments::Notes).string().null())
                    .to_owned(),
            )
            .await?;

        // assessments: remove cooperative_id, make document_title nullable, re-add dropped cols
        manager
            .alter_table(
                Table::alter()
                    .table(Assessments::Table)
                    .drop_column(Assessments::CooperativeId)
                    .modify_column(ColumnDef::new(Assessments::DocumentTitle).string().null())
                    .add_column(ColumnDef::new(Assessments::FileName).string().null())
                    .add_column(ColumnDef::new(Assessments::OverallScore).integer().null())
                    .add_column(
                        ColumnDef::new(Assessments::ExpectedCompletionDate)
                            .timestamp_with_time_zone()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Assessments {
    Table,
    AssessmentId,
    UserId,
    OrganizationId,
    CooperativeId,
    DocumentTitle,
    Status,
    StartedAt,
    CompletedAt,
    FileName,
    OverallScore,
    ExpectedCompletionDate,
}

#[derive(DeriveIden)]
enum DimensionAssessments {
    Table,
    DimensionAssessmentId,
    AssessmentId,
    DimensionId,
    CurrentStateId,
    DesiredStateId,
    CurrentScore,
    DesiredScore,
    Notes,
}

#[derive(DeriveIden)]
enum Reports {
    Table,
    ReportId,
    AssessmentId,
    ReportType,
    Title,
    Format,
    Summary,
    ReportData,
    FilePath,
    MinioPath,
    Status,
    GeneratedAt,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum OrganisationDimension {
    Table,
    OrganisationDimension,
    OrganisationId,
    DimensionId,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Dimensions {
    Table,
    DimensionId,
}
