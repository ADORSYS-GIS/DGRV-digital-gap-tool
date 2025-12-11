use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Convert current_states and desired_states timestamp columns to timestamptz
        manager
            .get_connection()
            .execute_unprepared(
                r#"
                ALTER TABLE current_states
                  ALTER COLUMN created_at TYPE timestamptz USING (created_at AT TIME ZONE 'UTC'),
                  ALTER COLUMN updated_at TYPE timestamptz USING (updated_at AT TIME ZONE 'UTC');

                ALTER TABLE desired_states
                  ALTER COLUMN created_at TYPE timestamptz USING (created_at AT TIME ZONE 'UTC'),
                  ALTER COLUMN updated_at TYPE timestamptz USING (updated_at AT TIME ZONE 'UTC');
                "#,
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Revert back to timestamp without time zone
        manager
            .get_connection()
            .execute_unprepared(
                r#"
                ALTER TABLE current_states
                  ALTER COLUMN created_at TYPE timestamp USING (created_at AT TIME ZONE 'UTC'),
                  ALTER COLUMN updated_at TYPE timestamp USING (updated_at AT TIME ZONE 'UTC');

                ALTER TABLE desired_states
                  ALTER COLUMN created_at TYPE timestamp USING (created_at AT TIME ZONE 'UTC'),
                  ALTER COLUMN updated_at TYPE timestamp USING (updated_at AT TIME ZONE 'UTC');
                "#,
            )
            .await?;

        Ok(())
    }
}
