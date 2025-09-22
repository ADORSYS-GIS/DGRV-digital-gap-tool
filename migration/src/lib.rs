pub use sea_orm_migration::prelude::*;

mod m20240922_000001_create_initial_tables;
mod m20240922_000002_create_remaining_tables;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240922_000001_create_initial_tables::Migration),
            Box::new(m20240922_000002_create_remaining_tables::Migration),
        ]
    }
}