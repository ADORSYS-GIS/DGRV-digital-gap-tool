use sea_orm::{Database, DatabaseConnection, DbErr};
use sea_orm_migration::MigratorTrait;
use tracing::info;

pub async fn init_db(database_url: &str) -> Result<DatabaseConnection, DbErr> {
    info!("Initializing database connection");
    Database::connect(database_url).await
}

pub async fn run_migrations(db: &DatabaseConnection) -> Result<(), DbErr> {
    info!("Running database migrations");
    // Migration implementation will be added later
    Ok(())
}

// Database connection pool management
pub struct DatabasePool {
    pub connection: DatabaseConnection,
}

impl DatabasePool {
    pub fn new(connection: DatabaseConnection) -> Self {
        Self { connection }
    }
}