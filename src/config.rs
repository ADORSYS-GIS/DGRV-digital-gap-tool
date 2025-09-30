use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub database_url: String,
    pub port: u16,
    pub keycloak_url: String,
    pub keycloak_realm: String,
    pub keycloak_client_id: String,
    pub keycloak_client_secret: String,
    pub jwt_secret: String,
    pub minio: MinioConfig,
}

#[derive(Debug, Deserialize)]
pub struct MinioConfig {
    pub endpoint: String,
    pub access_key: String,
    pub secret_key: String,
    pub bucket_name: String,
    pub use_ssl: bool,
}

impl Config {
    pub fn from_env() -> Result<Self, config::ConfigError> {
        let mut cfg = config::Config::builder();
        
        // Set defaults
        cfg = cfg.set_default("port", 8080)?;
        cfg = cfg.set_default("keycloak_realm", "dgat")?;
        cfg = cfg.set_default("keycloak_client_id", "dgat-backend")?;
        cfg = cfg.set_default("minio.use_ssl", true)?;
        cfg = cfg.set_default("minio.bucket_name", "reports")?;
        
        // Add environment variables
        cfg = cfg.add_source(config::Environment::with_prefix("DGAT").separator("_"));
        
        // Try to load from .env file
        if let Ok(_) = dotenv::dotenv() {
            cfg = cfg.add_source(config::File::with_name(".env"));
        }
        
        cfg.build()?.try_deserialize()
    }
}

pub fn load_config() -> anyhow::Result<Config> {
    Config::from_env().map_err(|e| anyhow::anyhow!("Failed to load configuration: {}", e))
}