use sea_orm::Statement;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop the gap_severity column if it exists
        let db = manager.get_connection();

        // Use raw SQL to drop the column if it exists
        let stmt = r#"
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'recommendations' 
                AND column_name = 'gap_severity'
            ) THEN
                ALTER TABLE recommendations DROP COLUMN gap_severity;
            END IF;
        END
        $$;
        "#;

        db.execute(Statement::from_string(
            manager.get_database_backend(),
            stmt.to_string(),
        ))
        .await?;

        Ok(())
    }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        // This is a destructive migration, so we won't implement down
        // as we can't reliably restore the previous state of the column
        Ok(())
    }
}
