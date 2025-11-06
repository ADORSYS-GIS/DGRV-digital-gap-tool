use envconfig::Envconfig;
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

#[derive(Envconfig)]
struct ConfigEnv {
    #[envconfig(
        from = "DGAT_DATABASE_URL",
        default = "postgres://postgres:postgres@localhost:5433/dgat"
    )]
    database_url: String,

    #[envconfig(from = "DGAT_PORT", default = "8080")]
    port: u16,

    #[envconfig(from = "DGAT_KEYCLOAK_URL", default = "http://localhost:8081")]
    keycloak_url: String,

    #[envconfig(from = "DGAT_KEYCLOAK_REALM", default = "dgat")]
    keycloak_realm: String,

    #[envconfig(from = "DGAT_KEYCLOAK_CLIENT_ID", default = "dgat-backend")]
    keycloak_client_id: String,

    #[envconfig(from = "DGAT_KEYCLOAK_CLIENT_SECRET", default = "dev-secret")]
    keycloak_client_secret: String,

    #[envconfig(from = "DGAT_JWT_SECRET", default = "dev-secret")]
    jwt_secret: String,

    // MinIO
    #[envconfig(from = "DGAT_MINIO_ENDPOINT", default = "http://localhost:9000")]
    minio_endpoint: String,

    #[envconfig(from = "DGAT_MINIO_ACCESS_KEY", default = "minioadmin")]
    minio_access_key: String,

    #[envconfig(from = "DGAT_MINIO_SECRET_KEY", default = "minioadmin")]
    minio_secret_key: String,

    #[envconfig(from = "DGAT_MINIO_BUCKET_NAME", default = "reports")]
    minio_bucket_name: String,

    #[envconfig(from = "DGAT_MINIO_USE_SSL", default = "false")]
    minio_use_ssl: bool,
}

impl Config {
    pub fn from_env() -> Result<Self, envconfig::Error> {
        // Load .env first for local development
        let _ = dotenv::dotenv();

        let e = ConfigEnv::init_from_env()?;
        Ok(Self {
            database_url: e.database_url,
            port: e.port,
            keycloak_url: e.keycloak_url,
            keycloak_realm: e.keycloak_realm,
            keycloak_client_id: e.keycloak_client_id,
            keycloak_client_secret: e.keycloak_client_secret,
            jwt_secret: e.jwt_secret,
            minio: MinioConfig {
                endpoint: e.minio_endpoint,
                access_key: e.minio_access_key,
                secret_key: e.minio_secret_key,
                bucket_name: e.minio_bucket_name,
                use_ssl: e.minio_use_ssl,
            },
        })
    }
}

pub fn load_config() -> anyhow::Result<Config> {
    Config::from_env().map_err(|e| anyhow::anyhow!("Failed to load configuration: {e}"))
}
