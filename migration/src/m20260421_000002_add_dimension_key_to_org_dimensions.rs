use sea_orm_migration::prelude::*;

/// Adds dimension_key to organisation_dimension table so org assignments
/// work across all language versions of a dimension.
#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add dimension_key column (nullable first)
        manager
            .alter_table(
                Table::alter()
                    .table(OrgDimension::Table)
                    .add_column(ColumnDef::new(OrgDimension::DimensionKey).uuid().null())
                    .to_owned(),
            )
            .await?;

        // Backfill dimension_key from dimensions table
        manager
            .get_connection()
            .execute_unprepared(
                "UPDATE organisation_dimension SET dimension_key = (
                    SELECT dimension_key FROM dimensions
                    WHERE dimensions.dimension_id = organisation_dimension.dimension_id
                ) WHERE dimension_key IS NULL",
            )
            .await?;

        // Make NOT NULL now that it's backfilled
        manager
            .alter_table(
                Table::alter()
                    .table(OrgDimension::Table)
                    .modify_column(ColumnDef::new(OrgDimension::DimensionKey).uuid().not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(OrgDimension::Table)
                    .drop_column(OrgDimension::DimensionKey)
                    .to_owned(),
            )
            .await
    }
}

#[derive(Iden)]
enum OrgDimension {
    Table,
    DimensionKey,
}
