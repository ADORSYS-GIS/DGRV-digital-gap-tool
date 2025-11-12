pub use sea_orm_migration::prelude::*;

mod m20240922_000001_create_initial_tables;
mod m20240922_000002_create_remaining_tables;
mod m20240924_000001_add_dimension_weights;
mod m20240924_000002_drop_ease_and_impact_column;
mod m20240924_000003_drop_recommendation_gap_size_columns;
mod m20240924_000004_drop_is_selected_column;
mod m20240924_000005_add_minio_path_to_reports;
mod m20251024_000001_update_schema;
mod m20251103_000001_gap_admin_config;
mod m20251107_000001_align_schema_with_er_diagram;
mod m20251111_000001_drop_dimension_assessment_id_from_gaps;
mod m20251112_000001_use_timestamptz_for_timestamps;
mod m20251110_110855_drop_state_fields;
mod m20251112_104100_alter_states_timestamps_to_timestamptz;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240922_000001_create_initial_tables::Migration),
            Box::new(m20240922_000002_create_remaining_tables::Migration),
            Box::new(m20240924_000001_add_dimension_weights::Migration),
            Box::new(m20240924_000002_drop_ease_and_impact_column::Migration),
            Box::new(m20240924_000003_drop_recommendation_gap_size_columns::Migration),
            Box::new(m20240924_000004_drop_is_selected_column::Migration),
            Box::new(m20240924_000005_add_minio_path_to_reports::Migration),
            Box::new(m20251024_000001_update_schema::Migration),
            Box::new(m20251103_000001_gap_admin_config::Migration),
            Box::new(m20251107_000001_align_schema_with_er_diagram::Migration),
            Box::new(m20251110_110855_drop_state_fields::Migration),
            Box::new(m20251111_000001_drop_dimension_assessment_id_from_gaps::Migration),
            Box::new(m20251112_000001_use_timestamptz_for_timestamps::Migration),
            Box::new(m20251112_104100_alter_states_timestamps_to_timestamptz::Migration),
        ]
    }
}