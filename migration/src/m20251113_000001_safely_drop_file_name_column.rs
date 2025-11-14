use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();
        
        // Use raw SQL to check if the column exists and drop it if it does
        sqlx::query(
            r#"
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'assessments' 
                    AND column_name = 'file_name'
                ) THEN
                    ALTER TABLE assessments DROP COLUMN file_name;
                END IF;
            END
            $$;
            "#
        )
        .execute(db)
        .await?;

        Ok(())
    }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        // We don't want to add the column back in the down migration
        // as it was intentionally removed
        Ok(())
    }
}
