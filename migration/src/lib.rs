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
mod m20251112_135000_add_dimensions_id_to_assessments;
mod m20251112_140000_alter_assessments_status_column;
mod m20251112_141000_remove_user_coop_metadata_from_assessments;
mod m20251112_141500_alter_assessments_timestamps_to_timestamptz;
mod m20251112_142500_update_dimension_assessments_table;
mod m20251112_145500_alter_dimension_assessments_timestamps_to_timestamptz;
mod m20251112_151500_alter_assessments_timestamps_to_timestamptz;
mod m20251113_105117_add_recommendation_priority_enum;
mod m20251113_113510_drop_gap_severity_column;
mod m20251113_124851_update_recommendations_timestamps;
mod m20251114_190500_add_gap_id_to_dimension_assessments;

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
            Box::new(m20251111_000001_drop_dimension_assessment_id_from_gaps::Migration),
            Box::new(m20251112_000001_use_timestamptz_for_timestamps::Migration),
            Box::new(m20251110_110855_drop_state_fields::Migration),
            Box::new(m20251112_104100_alter_states_timestamps_to_timestamptz::Migration),
            Box::new(m20251112_135000_add_dimensions_id_to_assessments::Migration),
            Box::new(m20251112_140000_alter_assessments_status_column::Migration),
            Box::new(m20251112_141000_remove_user_coop_metadata_from_assessments::Migration),
            Box::new(m20251112_141500_alter_assessments_timestamps_to_timestamptz::Migration),
            Box::new(m20251112_142500_update_dimension_assessments_table::Migration),
            Box::new(m20251112_145500_alter_dimension_assessments_timestamps_to_timestamptz::Migration),
            Box::new(m20251112_151500_alter_assessments_timestamps_to_timestamptz::Migration),
            Box::new(m20251113_105117_add_recommendation_priority_enum::Migration),
            Box::new(m20251113_113510_drop_gap_severity_column::Migration),
            Box::new(m20251113_124851_update_recommendations_timestamps::Migration),
            Box::new(m20251114_190500_add_gap_id_to_dimension_assessments::Migration),
        ]
    }
}