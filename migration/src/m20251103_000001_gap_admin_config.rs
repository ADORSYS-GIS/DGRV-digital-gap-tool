use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // gap_severity_rules
        manager
            .create_table(
                Table::create()
                    .table(GapSeverityRules::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(GapSeverityRules::RuleId).uuid().not_null().primary_key())
                    .col(ColumnDef::new(GapSeverityRules::DimensionId).uuid().null())
                    .col(ColumnDef::new(GapSeverityRules::MinAbsGap).integer().not_null())
                    .col(ColumnDef::new(GapSeverityRules::MaxAbsGap).integer().not_null())
                    .col(ColumnDef::new(GapSeverityRules::GapSeverity).string().not_null())
                    .col(ColumnDef::new(GapSeverityRules::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(GapSeverityRules::UpdatedAt).timestamp_with_time_zone().not_null())
                    .index(
                        Index::create()
                            .name("idx_gap_severity_rules_dim")
                            .col(GapSeverityRules::DimensionId)
                            .to_owned(),
                    )
                    .to_owned(),
            )
            .await?;

        // gap_descriptions
        manager
            .create_table(
                Table::create()
                    .table(GapDescriptions::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(GapDescriptions::GapDescriptionId).uuid().not_null().primary_key())
                    .col(ColumnDef::new(GapDescriptions::DimensionId).uuid().not_null())
                    .col(ColumnDef::new(GapDescriptions::GapSize).integer().not_null())
                    .col(ColumnDef::new(GapDescriptions::Description).text().not_null())
                    .col(ColumnDef::new(GapDescriptions::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(GapDescriptions::UpdatedAt).timestamp_with_time_zone().not_null())
                    .index(
                        Index::create()
                            .name("uk_gap_description_dim_size")
                            .col(GapDescriptions::DimensionId)
                            .col(GapDescriptions::GapSize)
                            .unique()
                            .to_owned(),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(GapDescriptions::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(GapSeverityRules::Table).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum GapSeverityRules {
    Table,
    RuleId,
    DimensionId,
    MinAbsGap,
    MaxAbsGap,
    GapSeverity,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum GapDescriptions {
    Table,
    GapDescriptionId,
    DimensionId,
    GapSize,
    Description,
    CreatedAt,
    UpdatedAt,
}
