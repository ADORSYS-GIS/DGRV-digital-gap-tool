use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
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
                    .col(
                        ColumnDef::new(OrganisationDimension::OrganisationId)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(OrganisationDimension::DimensionId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(OrganisationDimension::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(OrganisationDimension::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_organisation_dimension_dimension")
                            .from(
                                OrganisationDimension::Table,
                                OrganisationDimension::DimensionId,
                            )
                            .to(Dimensions::Table, Dimensions::DimensionId)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(OrganisationDimension::Table).to_owned())
            .await
    }
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
