#![allow(dead_code)]

pub mod api;
pub mod config;
pub mod database;
pub mod entities;
pub mod error;
pub mod repositories;
pub mod services;
pub mod models;
pub mod auth;

use crate::api::routes;
use crate::config::Config;
use crate::services::keycloak::KeycloakService;
use axum::Router;
use sea_orm::DatabaseConnection;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tracing::{info, warn, Level};
use tracing_subscriber::FmtSubscriber;
use crate::auth::jwt_validator::JwtValidator;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<DatabaseConnection>,
    pub keycloak_service: Arc<KeycloakService>,
    pub jwt_validator: Arc<JwtValidator>,
}

pub async fn run() -> anyhow::Result<()> {
    // Initialize tracing
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)?;

    info!("Starting DGAT Backend Server");

    // Validate OpenAPI specification at startup
    validate_openapi_spec();

    // Load configuration
    let config = config::load_config()?;

    // Initialize database connection
    let db = database::init_db(&config.database_url).await?;

    // Run migrations
    database::run_migrations(&db).await?;

    // Build our application with routes
    let app = create_app(db, config.clone());

    // Run the server
    let addr: SocketAddr = (config.host.parse::<std::net::IpAddr>()?, config.port).into();
    info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

fn create_app(db: DatabaseConnection, config: Config) -> Router {
    use http::header::{AUTHORIZATION, CONTENT_TYPE};
    use tower_http::cors::{Any, CorsLayer};

    let cors = CorsLayer::new()
        .allow_origin(["https://localhost".parse().unwrap()])
        .allow_methods(vec![
            http::Method::GET,
            http::Method::POST,
            http::Method::PUT,
            http::Method::DELETE,
            http::Method::OPTIONS,
        ])
        .allow_headers([AUTHORIZATION, CONTENT_TYPE])
        .allow_credentials(true);

    let state = AppState {
        db: Arc::new(db),
        keycloak_service: Arc::new(KeycloakService::new(config.clone())),
        jwt_validator: Arc::new(JwtValidator::new(config.keycloak.clone())),
    };

    // Create API router with all routes
    let api_router = routes::api::create_api_routes(state.clone())
        .layer(axum::middleware::from_fn_with_state(state.clone(), crate::auth::middleware::auth_middleware));

    // Combine all routers and prefix with /api
    Router::new()
        .nest("/api", api_router)
        .merge(api::openapi::docs_routes())
        .with_state(state)
        .layer(cors)
        
}

/// Validates the OpenAPI specification at startup
///
/// This function generates the OpenAPI spec and validates it using the openapiv3 crate.
/// If validation fails, the server will panic with a detailed error message.
/// This ensures that invalid OpenAPI specs are caught immediately during development
/// and deployment, rather than being discovered by API consumers.
#[cfg(not(debug_assertions))]
fn validate_openapi_spec() {
    use api::openapi::ApiDoc;
    use utoipa::OpenApi;

    info!("Validating OpenAPI specification...");

    let spec = ApiDoc::openapi();

    // Serialize to JSON
    let json = match serde_json::to_string(&spec) {
        Ok(j) => j,
        Err(e) => {
            panic!(
                "Failed to serialize OpenAPI spec to JSON: {}\n\
                 This is a critical error - the OpenAPI spec cannot be serialized.",
                e
            );
        }
    };

    // Validate using openapiv3
    match serde_json::from_str::<openapiv3::OpenAPI>(&json) {
        Ok(parsed_spec) => {
            info!("✓ OpenAPI specification is valid");
            info!("  - Paths: {}", parsed_spec.paths.paths.len());
            if let Some(components) = &parsed_spec.components {
                info!("  - Schemas: {}", components.schemas.len());
            }
        }
        Err(e) => {
            panic!(
                "❌ INVALID OPENAPI SPECIFICATION DETECTED!\n\
                 \n\
                 Error: {}\n\
                 \n\
                 The generated OpenAPI spec has validation errors.\n\
                 This will break API documentation, client code generation, and other tools.\n\
                 \n\
                 Common causes:\n\
                 - Missing schema definitions in components (unresolved $ref)\n\
                 - Invalid utoipa annotations on handlers or DTOs\n\
                 - Circular references in schemas\n\
                 - Missing required fields in path definitions\n\
                 \n\
                 Please fix the utoipa annotations in your code and run tests.\n\
                 Run 'cargo test test_openapi_spec_is_valid' for more details.\n\
                 \n\
                 Server startup aborted.",
                e
            );
        }
    }
}

/// In debug mode, only warn about OpenAPI validation failures
/// This allows development to continue even with invalid specs
#[cfg(debug_assertions)]
fn validate_openapi_spec() {
    use api::openapi::ApiDoc;
    use utoipa::OpenApi;

    info!("Validating OpenAPI specification (debug mode)...");

    let spec = ApiDoc::openapi();

    let json = match serde_json::to_string(&spec) {
        Ok(j) => j,
        Err(e) => {
            warn!("Failed to serialize OpenAPI spec: {}", e);
            return;
        }
    };

    match serde_json::from_str::<openapiv3::OpenAPI>(&json) {
        Ok(parsed_spec) => {
            info!("✓ OpenAPI specification is valid");
            info!("  - Paths: {}", parsed_spec.paths.paths.len());
            if let Some(components) = &parsed_spec.components {
                info!("  - Schemas: {}", components.schemas.len());
            }
        }
        Err(e) => {
            warn!(
                "⚠ OpenAPI specification validation failed (debug mode - continuing anyway):\n{}\n\
                 Run 'cargo test test_openapi_spec_is_valid' for details.",
                e
            );
        }
    }
}
