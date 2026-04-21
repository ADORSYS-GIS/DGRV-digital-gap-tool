use sea_orm_migration::prelude::*;

/// This migration fixes the multilingual dimension model:
///
/// 1. Drops the global UNIQUE constraint on dimensions.name
///    (same logical dimension can have the same name in different languages)
/// 2. Adds a `dimension_key` UUID column to dimensions — the stable cross-language
///    identifier that ties all language versions of the same dimension together
/// 3. Backfills dimension_key = dimension_id for all existing rows
/// 4. Adds UNIQUE(dimension_key, language) so each logical dimension has at most
///    one row per language
/// 5. Drops the old (dimension_id, score) and (dimension_id, description) unique
///    constraints on current_states and desired_states — they prevent adding the
///    same level number in multiple languages
/// 6. Adds (dimension_id, score, language) unique constraints instead
#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // 1. Drop the global unique constraint on dimensions.name using raw SQL
        manager
            .get_connection()
            .execute_unprepared("ALTER TABLE dimensions DROP CONSTRAINT IF EXISTS dimensions_name_key")
            .await
            .ok();

        // 2. Add dimension_key column (nullable first so existing rows don't fail)
        manager
            .alter_table(
                Table::alter()
                    .table(Dimensions::Table)
                    .add_column(
                        ColumnDef::new(Dimensions::DimensionKey)
                            .uuid()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        // 3. Backfill dimension_key = dimension_id for all existing rows
        manager
            .get_connection()
            .execute_unprepared(
                "UPDATE dimensions SET dimension_key = dimension_id WHERE dimension_key IS NULL",
            )
            .await?;

        // 4. Make dimension_key NOT NULL now that it's backfilled
        manager
            .alter_table(
                Table::alter()
                    .table(Dimensions::Table)
                    .modify_column(
                        ColumnDef::new(Dimensions::DimensionKey)
                            .uuid()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await?;

        // 5. Add UNIQUE(dimension_key, language)
        manager
            .create_index(
                Index::create()
                    .name("idx_dimensions_key_language")
                    .table(Dimensions::Table)
                    .col(Dimensions::DimensionKey)
                    .col(Dimensions::Language)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // 6. Drop old (dimension_id, score) unique constraints on states using raw SQL
        for stmt in [
            "ALTER TABLE current_states DROP CONSTRAINT IF EXISTS idx_current_states_dimension_id_score",
            "ALTER TABLE current_states DROP CONSTRAINT IF EXISTS idx_current_states_dimension_id_description",
            "ALTER TABLE desired_states DROP CONSTRAINT IF EXISTS idx_desired_states_dimension_id_score",
            "ALTER TABLE desired_states DROP CONSTRAINT IF EXISTS idx_desired_states_dimension_id_description",
        ] {
            manager.get_connection().execute_unprepared(stmt).await.ok();
        }

        // 7. Add (dimension_id, score, language) unique constraints
        manager
            .create_index(
                Index::create()
                    .name("idx_current_states_dim_score_lang")
                    .table(CurrentStates::Table)
                    .col(CurrentStates::DimensionId)
                    .col(CurrentStates::Score)
                    .col(CurrentStates::Language)
                    .unique()
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_desired_states_dim_score_lang")
                    .table(DesiredStates::Table)
                    .col(DesiredStates::DimensionId)
                    .col(DesiredStates::Score)
                    .col(DesiredStates::Language)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // 8. Add dimension_key to child tables (current_states, desired_states, recommendations, gaps)
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .add_column(ColumnDef::new(CurrentStates::DimensionKey).uuid().null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .add_column(ColumnDef::new(DesiredStates::DimensionKey).uuid().null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Recommendations::Table)
                    .add_column(ColumnDef::new(Recommendations::DimensionKey).uuid().null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Gaps::Table)
                    .add_column(ColumnDef::new(Gaps::DimensionKey).uuid().null())
                    .to_owned(),
            )
            .await?;

        // 9. Backfill dimension_key from dimensions table via join
        manager
            .get_connection()
            .execute_unprepared(
                "UPDATE current_states SET dimension_key = (SELECT dimension_key FROM dimensions WHERE dimensions.dimension_id = current_states.dimension_id) WHERE dimension_key IS NULL",
            )
            .await?;

        manager
            .get_connection()
            .execute_unprepared(
                "UPDATE desired_states SET dimension_key = (SELECT dimension_key FROM dimensions WHERE dimensions.dimension_id = desired_states.dimension_id) WHERE dimension_key IS NULL",
            )
            .await?;

        manager
            .get_connection()
            .execute_unprepared(
                "UPDATE recommendations SET dimension_key = (SELECT dimension_key FROM dimensions WHERE dimensions.dimension_id = recommendations.dimension_id) WHERE dimension_key IS NULL",
            )
            .await?;

        manager
            .get_connection()
            .execute_unprepared(
                "UPDATE gaps SET dimension_key = (SELECT dimension_key FROM dimensions WHERE dimensions.dimension_id = gaps.dimension_id) WHERE dimension_key IS NULL",
            )
            .await?;

        // 10. Make dimension_key NOT NULL now that it's backfilled
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .modify_column(ColumnDef::new(CurrentStates::DimensionKey).uuid().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .modify_column(ColumnDef::new(DesiredStates::DimensionKey).uuid().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Recommendations::Table)
                    .modify_column(ColumnDef::new(Recommendations::DimensionKey).uuid().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Gaps::Table)
                    .modify_column(ColumnDef::new(Gaps::DimensionKey).uuid().not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        for table in ["current_states", "desired_states", "recommendations", "gaps"] {
            manager
                .get_connection()
                .execute_unprepared(&format!("ALTER TABLE {} DROP COLUMN IF EXISTS dimension_key", table))
                .await
                .ok();
        }
        manager.drop_index(Index::drop().name("idx_desired_states_dim_score_lang").table(DesiredStates::Table).to_owned()).await.ok();
        manager.drop_index(Index::drop().name("idx_current_states_dim_score_lang").table(CurrentStates::Table).to_owned()).await.ok();
        manager.drop_index(Index::drop().name("idx_dimensions_key_language").table(Dimensions::Table).to_owned()).await.ok();
        manager.alter_table(Table::alter().table(Dimensions::Table).drop_column(Dimensions::DimensionKey).to_owned()).await
    }
}

#[derive(Iden)]
enum Dimensions {
    Table,
    DimensionKey,
    Language,
}

#[derive(Iden)]
enum CurrentStates {
    Table,
    DimensionId,
    DimensionKey,
    Score,
    Language,
}

#[derive(Iden)]
enum DesiredStates {
    Table,
    DimensionId,
    DimensionKey,
    Score,
    Language,
}

#[derive(Iden)]
enum Recommendations {
    Table,
    DimensionKey,
}

#[derive(Iden)]
enum Gaps {
    Table,
    DimensionKey,
}
