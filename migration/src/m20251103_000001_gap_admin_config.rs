use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // No-op: gap severity rules and descriptions tables are not required
        let _ = manager;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let _ = manager;
        Ok(())
    }
}

#[allow(dead_code)]
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

#[allow(dead_code)]
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
