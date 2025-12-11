use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .get_connection()
            .execute_unprepared(
                "ALTER TABLE \"assessments\" ALTER COLUMN \"created_at\" TYPE timestamptz USING \"created_at\"::timestamptz,
                ALTER COLUMN \"updated_at\" TYPE timestamptz USING \"updated_at\"::timestamptz",
            )
            .await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .get_connection()
            .execute_unprepared(
                "ALTER TABLE \"assessments\" ALTER COLUMN \"created_at\" TYPE timestamp USING \"created_at\"::timestamp,
                ALTER COLUMN \"updated_at\" TYPE timestamp USING \"updated_at\"::timestamp",
            )
            .await?;
        Ok(())
    }
}
