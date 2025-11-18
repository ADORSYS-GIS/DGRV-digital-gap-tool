use sea_orm_migration::prelude::*;
use sea_orm::Statement;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();
        
        // Update created_at column to TIMESTAMPTZ
        let update_created_at = r#"
        ALTER TABLE recommendations 
        ALTER COLUMN created_at TYPE TIMESTAMPTZ 
        USING created_at AT TIME ZONE 'UTC';
        "#;
        
        // Update updated_at column to TIMESTAMPTZ
        let update_updated_at = r#"
        ALTER TABLE recommendations 
        ALTER COLUMN updated_at TYPE TIMESTAMPTZ 
        USING updated_at AT TIME ZONE 'UTC';
        "#;
        
        // Execute the updates
        db.execute(Statement::from_string(manager.get_database_backend(), update_created_at.to_string()))
            .await?;
            
        db.execute(Statement::from_string(manager.get_database_backend(), update_updated_at.to_string()))
            .await?;
            
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();
        
        // Revert updated_at column back to TIMESTAMP
        let revert_updated_at = r#"
        ALTER TABLE recommendations 
        ALTER COLUMN updated_at TYPE TIMESTAMP 
        USING updated_at AT TIME ZONE 'UTC';
        "#;
        
        // Revert created_at column back to TIMESTAMP
        let revert_created_at = r#"
        ALTER TABLE recommendations 
        ALTER COLUMN created_at TYPE TIMESTAMP 
        USING created_at AT TIME ZONE 'UTC';
        "#;
        
        // Execute the reverts in reverse order
        db.execute(Statement::from_string(manager.get_database_backend(), revert_updated_at.to_string()))
            .await?;
            
        db.execute(Statement::from_string(manager.get_database_backend(), revert_created_at.to_string()))
            .await?;
            
        Ok(())
    }
}
