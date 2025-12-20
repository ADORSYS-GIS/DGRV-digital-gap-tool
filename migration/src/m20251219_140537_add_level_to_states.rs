 use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();
        db.execute_unprepared(
            r#"ALTER TABLE "current_states" ADD COLUMN IF NOT EXISTS "level" varchar NULL;"#,
        )
        .await?;
        db.execute_unprepared(
            r#"ALTER TABLE "desired_states" ADD COLUMN IF NOT EXISTS "level" varchar NULL;"#,
        )
        .await
        .map(|_| ())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();
        db.execute_unprepared(r#"ALTER TABLE "current_states" DROP COLUMN IF EXISTS "level";"#)
            .await?;
        db.execute_unprepared(r#"ALTER TABLE "desired_states" DROP COLUMN IF EXISTS "level";"#)
            .await
            .map(|_| ())
    }
}
