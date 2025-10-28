mod api;
mod config;
mod database;
mod entities;
mod error;
mod repositories;
mod services;

use axum::Router;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;
use sea_orm::DatabaseConnection;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)?;

    info!("Starting DGAT Backend Server");

    // Load configuration
    let config = config::load_config()?;
    
    // Initialize database connection
    let db = database::init_db(&config.database_url).await?;
    
    // Run migrations
    database::run_migrations(&db).await?;

    // Build our application with routes
    let app = create_app(db);

    // Run the server
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    info!("Server listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

fn create_app(db: DatabaseConnection) -> Router {
    api::routes::api::create_api_routes()
        .merge(api::openapi::docs_routes())
        .with_state(db)
        .layer(CorsLayer::permissive())
}