use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create report_status enum
        manager
            .get_connection()
            .execute_unprepared(
                "CREATE TYPE report_status AS ENUM ('pending', 'generating', 'completed', 'failed')",
            )
            .await
            .ok(); // Ignore error if type already exists

        // Add status column to reports table
        manager
            .get_connection()
            .execute_unprepared(
                "ALTER TABLE reports ADD COLUMN IF NOT EXISTS status report_status NOT NULL DEFAULT 'pending'",
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Remove the status column
        manager
            .get_connection()
            .execute_unprepared("ALTER TABLE reports DROP COLUMN status")
            .await?;

        // Drop the report_status enum
        manager
            .get_connection()
            .execute_unprepared("DROP TYPE report_status")
            .await?;

        Ok(())
    }
}