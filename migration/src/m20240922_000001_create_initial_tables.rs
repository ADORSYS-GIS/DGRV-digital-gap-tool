
use sea_orm_migration::prelude::*;
use sea_orm_migration::prelude::extension::postgres::Type;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create dimensions table
        manager
            .create_table(
                Table::create()
                    .table(Dimensions::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Dimensions::DimensionId).uuid().not_null().primary_key())
                    .col(ColumnDef::new(Dimensions::Name).string().not_null().unique_key())
                    .col(ColumnDef::new(Dimensions::Description).text())
                    .col(ColumnDef::new(Dimensions::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Dimensions::UpdatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .to_owned(),
            )
            .await?;

        // Create current_states table
        manager
            .create_table(
                Table::create()
                    .table(CurrentStates::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(CurrentStates::CurrentStateId).uuid().not_null().primary_key())
                    .col(ColumnDef::new(CurrentStates::DimensionId).uuid().not_null())
                    .col(ColumnDef::new(CurrentStates::Title).string().not_null())
                    .col(ColumnDef::new(CurrentStates::Description).text())
                    .col(ColumnDef::new(CurrentStates::Score).integer().not_null())
                    .col(ColumnDef::new(CurrentStates::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(CurrentStates::UpdatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_current_states_dimensions")
                            .from(CurrentStates::Table, CurrentStates::DimensionId)
                            .to(Dimensions::Table, Dimensions::DimensionId)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create desired_states table
        manager
            .create_table(
                Table::create()
                    .table(DesiredStates::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(DesiredStates::DesiredStateId).uuid().not_null().primary_key())
                    .col(ColumnDef::new(DesiredStates::DimensionId).uuid().not_null())
                    .col(ColumnDef::new(DesiredStates::Title).string().not_null())
                    .col(ColumnDef::new(DesiredStates::Description).text())
                    .col(ColumnDef::new(DesiredStates::Score).integer().not_null())
                    .col(ColumnDef::new(DesiredStates::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(DesiredStates::UpdatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_desired_states_dimensions")
                            .from(DesiredStates::Table, DesiredStates::DimensionId)
                            .to(Dimensions::Table, Dimensions::DimensionId)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create assessment_status enum
        manager
            .create_type(
                Type::create()
                    .as_enum(AssessmentStatus::Enum)
                    .values([
                        AssessmentStatus::Draft,
                        AssessmentStatus::InProgress,
                        AssessmentStatus::Completed,
                        AssessmentStatus::Archived,
                    ])
                    .to_owned(),
            )
            .await?;
        // Create assessments table
        manager
            .create_table(
                Table::create()
                    .table(Assessments::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Assessments::AssessmentId).uuid().not_null().primary_key())
                    .col(ColumnDef::new(Assessments::UserId).string())
                    .col(ColumnDef::new(Assessments::OrganizationId).string().not_null())
                    .col(ColumnDef::new(Assessments::DocumentTitle).string().not_null())
                    .col(
                        ColumnDef::new(Assessments::Status)
                            .enumeration(
                                AssessmentStatus::Enum,
                                [
                                    AssessmentStatus::Draft,
                                    AssessmentStatus::InProgress,
                                    AssessmentStatus::Completed,
                                    AssessmentStatus::Archived,
                                ],
                            )
                            .not_null()
                            .default("draft"),
                    )
                    .col(ColumnDef::new(Assessments::StartedAt).timestamp())
                    .col(ColumnDef::new(Assessments::CompletedAt).timestamp())
                    .col(ColumnDef::new(Assessments::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Assessments::UpdatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Assessments::Metadata).json())
                    .to_owned(),
            )
            .await?;

        // Create dimension_assessments table
        manager
            .create_table(
                Table::create()
                    .table(DimensionAssessments::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(DimensionAssessments::DimensionAssessmentId).uuid().not_null().primary_key())
                    .col(ColumnDef::new(DimensionAssessments::AssessmentId).uuid().not_null())
                    .col(ColumnDef::new(DimensionAssessments::DimensionId).uuid().not_null())
                    .col(ColumnDef::new(DimensionAssessments::CurrentStateId).uuid().not_null())
                    .col(ColumnDef::new(DimensionAssessments::DesiredStateId).uuid().not_null())
                    .col(ColumnDef::new(DimensionAssessments::CurrentScore).integer().not_null())
                    .col(ColumnDef::new(DimensionAssessments::DesiredScore).integer().not_null())
                    .col(ColumnDef::new(DimensionAssessments::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(DimensionAssessments::UpdatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .to_owned(),
            )
            .await?;

        // Create gaps table
        manager
            .create_table(
                Table::create()
                    .table(Gaps::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Gaps::GapId).uuid().not_null().primary_key())
                    .col(ColumnDef::new(Gaps::DimensionAssessmentId).uuid().not_null())
                    .col(ColumnDef::new(Gaps::DimensionId).uuid().not_null())
                    .col(ColumnDef::new(Gaps::GapSize).integer().not_null())
                    .col(ColumnDef::new(Gaps::GapSeverity).string().not_null())
                    .col(ColumnDef::new(Gaps::GapDescription).text())
                    .col(ColumnDef::new(Gaps::CalculatedAt).timestamp_with_time_zone().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Gaps::CreatedAt).timestamp_with_time_zone().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Gaps::UpdatedAt).timestamp_with_time_zone().not_null().default(Expr::current_timestamp()))
                    .to_owned(),
            )
            .await?;

        // Create recommendations table
        manager
            .create_table(
                Table::create()
                    .table(Recommendations::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Recommendations::RecommendationId).uuid().not_null().primary_key())
                    .col(ColumnDef::new(Recommendations::DimensionId).uuid().not_null())
                    .col(ColumnDef::new(Recommendations::GapSeverity).string().not_null())
                    .col(ColumnDef::new(Recommendations::Priority).string().not_null())
                    .col(ColumnDef::new(Recommendations::Description).text().not_null())
                    .col(ColumnDef::new(Recommendations::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Recommendations::UpdatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .to_owned(),
            )
            .await?;

        // Create assessment_recommendations table
        manager
            .create_table(
                Table::create()
                    .table(AssessmentRecommendations::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(AssessmentRecommendations::AssessmentRecommendationId).uuid().not_null().primary_key())
                    .col(ColumnDef::new(AssessmentRecommendations::AssessmentId).uuid().not_null())
                    .col(ColumnDef::new(AssessmentRecommendations::RecommendationId).uuid().not_null())
                    .col(ColumnDef::new(AssessmentRecommendations::GapValue).integer().not_null())
                    .col(ColumnDef::new(AssessmentRecommendations::CustomNotes).text())
                    .col(ColumnDef::new(AssessmentRecommendations::ImplementationStatus).string().not_null().default("planned"))
                    .col(ColumnDef::new(AssessmentRecommendations::SelectedAt).timestamp())
                    .col(ColumnDef::new(AssessmentRecommendations::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(AssessmentRecommendations::UpdatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .to_owned(),
            )
            .await?;

        // Create reports table
        manager
            .create_table

            (
                Table::create()
                    .table(Reports::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Reports::ReportId).uuid().not_null().primary_key())
                    .col(ColumnDef::new(Reports::AssessmentId).uuid().not_null())
                    .col(ColumnDef::new(Reports::ReportType).string().not_null())
                    .col(ColumnDef::new(Reports::Title).string().not_null())
                    .col(ColumnDef::new(Reports::Format).string().not_null())
                    .col(ColumnDef::new(Reports::Summary).text())
                    .col(ColumnDef::new(Reports::ReportData).json())
                    .col(ColumnDef::new(Reports::FilePath).string())
                    .col(ColumnDef::new(Reports::Status).string().not_null().default("pending"))
                    .col(ColumnDef::new(Reports::GeneratedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Reports::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Reports::UpdatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_reports_assessments")
                            .from(Reports::Table, Reports::AssessmentId)
                            .to(Assessments::Table, Assessments::AssessmentId)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Add foreign keys for dimension_assessments table
        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_dimension_assessments_assessments")
                    .from(DimensionAssessments::Table, DimensionAssessments::AssessmentId)
                    .to(Assessments::Table, Assessments::AssessmentId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_dimension_assessments_dimensions")
                    .from(DimensionAssessments::Table, DimensionAssessments::DimensionId)
                    .to(Dimensions::Table, Dimensions::DimensionId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_dimension_assessments_current_states")
                    .from(DimensionAssessments::Table, DimensionAssessments::CurrentStateId)
                    .to(CurrentStates::Table, CurrentStates::CurrentStateId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_dimension_assessments_desired_states")
                    .from(DimensionAssessments::Table, DimensionAssessments::DesiredStateId)
                    .to(DesiredStates::Table, DesiredStates::DesiredStateId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        // Add foreign keys for gaps table
        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_gaps_dimension_assessments")
                    .from(Gaps::Table, Gaps::DimensionAssessmentId)
                    .to(DimensionAssessments::Table, DimensionAssessments::DimensionAssessmentId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_gaps_dimensions")
                    .from(Gaps::Table, Gaps::DimensionId)
                    .to(Dimensions::Table, Dimensions::DimensionId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        // Add foreign keys for recommendations table
        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_recommendations_dimensions")
                    .from(Recommendations::Table, Recommendations::DimensionId)
                    .to(Dimensions::Table, Dimensions::DimensionId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        // Add foreign keys for assessment_recommendations table
        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_assessment_recommendations_assessments")
                    .from(AssessmentRecommendations::Table, AssessmentRecommendations::AssessmentId)
                    .to(Assessments::Table, Assessments::AssessmentId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_assessment_recommendations_recommendations")
                    .from(AssessmentRecommendations::Table, AssessmentRecommendations::RecommendationId)
                    .to(Recommendations::Table, Recommendations::RecommendationId)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop tables in reverse order (respect foreign key constraints)
        manager
            .drop_table(Table::drop().table(AssessmentRecommendations::Table).if_exists().to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Recommendations::Table).if_exists().to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Gaps::Table).if_exists().to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(DimensionAssessments::Table).if_exists().to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Reports::Table).if_exists().to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Assessments::Table).if_exists().to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(DesiredStates::Table).if_exists().to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(CurrentStates::Table).if_exists().to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Dimensions::Table).if_exists().to_owned())
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Dimensions {
    Table,
    DimensionId,
    Name,
    Description,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum CurrentStates {
    Table,
    CurrentStateId,
    DimensionId,
    Title,
    Description,
    Score,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum DesiredStates {
    Table,
    DesiredStateId,
    DimensionId,
    Title,
    Description,
    Score,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Assessments {
    Table,
    AssessmentId,
    UserId,
    OrganizationId,
    DocumentTitle,
    Status,
    StartedAt,
    CompletedAt,
    CreatedAt,
    UpdatedAt,
    Metadata,
}

#[derive(DeriveIden)]
enum AssessmentStatus {
    Enum,
    Draft,
    InProgress,
    Completed,
    Archived,
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
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Gaps {
    Table,
    GapId,
    DimensionAssessmentId,
    DimensionId,
    GapSize,
    GapSeverity,
    GapDescription,
    CalculatedAt,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Recommendations {
    Table,
    RecommendationId,
    DimensionId,
    GapSeverity,
    Priority,
    Description,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum AssessmentRecommendations {
    Table,
    AssessmentRecommendationId,
    AssessmentId,
    RecommendationId,
    GapValue,
    CustomNotes,
    ImplementationStatus,
    SelectedAt,
    CreatedAt,
    UpdatedAt,
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
    Status,
    GeneratedAt,
    CreatedAt,
    UpdatedAt,
}
