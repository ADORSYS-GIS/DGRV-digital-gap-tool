use sea_orm_migration::prelude::*;
#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create report_type enum
        manager
            .get_connection()
            .execute_unprepared(
                "CREATE TYPE report_type AS ENUM ('summary', 'detailed', 'action_plan')",
            )
            .await?;

        // Create report_format enum
        manager
            .get_connection()
            .execute_unprepared("CREATE TYPE report_format AS ENUM ('pdf', 'excel', 'json')")
            .await?;

        // Alter reports table to use the new enums
        manager
            .get_connection()
            .execute_unprepared(
                "ALTER TABLE reports ALTER COLUMN report_type TYPE report_type USING report_type::text::report_type",
            )
            .await?;
        manager
            .get_connection()
            .execute_unprepared(
                "ALTER TABLE reports ALTER COLUMN format TYPE report_format USING format::text::report_format",
            )
            .await?;

        // Create report_status enum
        manager
            .get_connection()
            .execute_unprepared(
                "CREATE TYPE report_status AS ENUM ('pending', 'generating', 'completed', 'failed')",
            )
            .await?;

        // Add status column to reports table
        manager
            .get_connection()
            .execute_unprepared(
                "ALTER TABLE reports ADD COLUMN status report_status NOT NULL DEFAULT 'pending'",
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

        // Revert the column types to string
        manager
            .get_connection()
            .execute_unprepared("ALTER TABLE reports ALTER COLUMN report_type TYPE VARCHAR(255)")
            .await?;
        manager
            .get_connection()
            .execute_unprepared("ALTER TABLE reports ALTER COLUMN format TYPE VARCHAR(255)")
            .await?;

        // Drop the enums
        manager
            .get_connection()
            .execute_unprepared("DROP TYPE report_type")
            .await?;
        manager
            .get_connection()
            .execute_unprepared("DROP TYPE report_format")
            .await?;

        Ok(())
    }
}