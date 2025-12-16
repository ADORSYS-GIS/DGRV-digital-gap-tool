use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add unique constraint for (dimension_id, score) in current_states
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .add_unique_key(
                        Alias::new("idx_current_states_dimension_id_score"),
                        vec![CurrentStates::DimensionId, CurrentStates::Score],
                    )
                    .to_owned(),
            )
            .await?;

        // Add unique constraint for (dimension_id, description) in current_states
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .add_unique_key(
                        Alias::new("idx_current_states_dimension_id_description"),
                        vec![CurrentStates::DimensionId, CurrentStates::Description],
                    )
                    .to_owned(),
            )
            .await?;

        // Add unique constraint for (dimension_id, score) in desired_states
        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .add_unique_key(
                        Alias::new("idx_desired_states_dimension_id_score"),
                        vec![DesiredStates::DimensionId, DesiredStates::Score],
                    )
                    .to_owned(),
            )
            .await?;

        // Add unique constraint for (dimension_id, description) in desired_states
        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .add_unique_key(
                        Alias::new("idx_desired_states_dimension_id_description"),
                        vec![DesiredStates::DimensionId, DesiredStates::Description],
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop unique constraint for (dimension_id, score) in current_states
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .drop_unique_key(Alias::new("idx_current_states_dimension_id_score"))
                    .to_owned(),
            )
            .await?;

        // Drop unique constraint for (dimension_id, description) in current_states
        manager
            .alter_table(
                Table::alter()
                    .table(CurrentStates::Table)
                    .drop_unique_key(Alias::new("idx_current_states_dimension_id_description"))
                    .to_owned(),
            )
            .await?;

        // Drop unique constraint for (dimension_id, score) in desired_states
        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .drop_unique_key(Alias::new("idx_desired_states_dimension_id_score"))
                    .to_owned(),
            )
            .await?;

        // Drop unique constraint for (dimension_id, description) in desired_states
        manager
            .alter_table(
                Table::alter()
                    .table(DesiredStates::Table)
                    .drop_unique_key(Alias::new("idx_desired_states_dimension_id_description"))
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum CurrentStates {
    Table,
    DimensionId,
    Score,
    Description,
}

#[derive(DeriveIden)]
enum DesiredStates {
    Table,
    DimensionId,
    Score,
    Description,
}