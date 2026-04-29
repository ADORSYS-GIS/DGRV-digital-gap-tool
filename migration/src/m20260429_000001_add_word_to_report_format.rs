use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add 'word' to report_format enum
        // Note: PostgreSQL doesn't allow adding values to enums within a transaction block easily in some versions,
        // but adding a value is usually fine if it's a stand-alone command.
        manager
            .get_connection()
            .execute_unprepared("ALTER TYPE report_format ADD VALUE 'word'")
            .await
            .ok(); // ok() because it might already exist if migration is re-run or partially failed
        
        Ok(())
    }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        // PostgreSQL does not support removing values from an ENUM.
        // Usually, 'down' migrations for enum additions are left empty or involve recreating the type.
        // Given the complexity of recreating types and updating tables, we leave it empty.
        Ok(())
    }
}
