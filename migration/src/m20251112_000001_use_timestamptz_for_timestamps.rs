use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Convert gaps timestamp columns to timestamptz (interpret existing as UTC)
        // Using raw SQL to include USING clause for safe conversion
        manager
            .get_connection()
            .execute_unprepared(
                r#"
                ALTER TABLE gaps
                  ALTER COLUMN calculated_at TYPE timestamptz USING (calculated_at AT TIME ZONE 'UTC'),
                  ALTER COLUMN created_at    TYPE timestamptz USING (created_at AT TIME ZONE 'UTC'),
                  ALTER COLUMN updated_at    TYPE timestamptz USING (updated_at AT TIME ZONE 'UTC');
                "#,
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Revert back to timestamp without time zone (interpret timestamptz as UTC clock time)
        manager
            .get_connection()
            .execute_unprepared(
                r#"
                ALTER TABLE gaps
                  ALTER COLUMN calculated_at TYPE timestamp USING (calculated_at AT TIME ZONE 'UTC'),
                  ALTER COLUMN created_at    TYPE timestamp USING (created_at AT TIME ZONE 'UTC'),
                  ALTER COLUMN updated_at    TYPE timestamp USING (updated_at AT TIME ZONE 'UTC');
                "#,
            )
            .await?;

        Ok(())
    }
}
