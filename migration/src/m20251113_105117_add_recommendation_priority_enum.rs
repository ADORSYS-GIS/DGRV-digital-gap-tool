use sea_orm::Statement;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create the recommendation_priority enum type
        let db = manager.get_connection();

        // First, create the enum type using raw SQL
        let stmt = r#"
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recommendation_priority') THEN
                CREATE TYPE recommendation_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
            END IF;
        END
        $$;
        "#;

        db.execute(Statement::from_string(
            manager.get_database_backend(),
            stmt.to_string(),
        ))
        .await?;

        // Now update the recommendations table to use this enum type for the priority column
        // We'll use raw SQL for this as well to avoid type issues
        let alter_table_sql = r#"
        ALTER TABLE recommendations 
        ALTER COLUMN priority TYPE recommendation_priority 
        USING priority::recommendation_priority,
        ALTER COLUMN priority SET DEFAULT 'MEDIUM'::recommendation_priority;
        "#;

        db.execute(Statement::from_string(
            manager.get_database_backend(),
            alter_table_sql.to_string(),
        ))
        .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();

        // First, update the recommendations table to use text instead of the enum
        let alter_table_sql = r#"
        ALTER TABLE recommendations 
        ALTER COLUMN priority TYPE TEXT 
        USING priority::TEXT,
        ALTER COLUMN priority SET DEFAULT 'MEDIUM';
        "#;

        db.execute(Statement::from_string(
            manager.get_database_backend(),
            alter_table_sql.to_string(),
        ))
        .await?;

        // Then drop the enum type if it exists
        let drop_type_sql = r#"
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recommendation_priority') THEN
                DROP TYPE recommendation_priority;
            END IF;
        END
        $$;
        "#;

        db.execute(Statement::from_string(
            manager.get_database_backend(),
            drop_type_sql.to_string(),
        ))
        .await?;

        Ok(())
    }
}

#[allow(dead_code)]
#[derive(DeriveIden)]
enum Recommendations {
    Table,
    Priority,
}
