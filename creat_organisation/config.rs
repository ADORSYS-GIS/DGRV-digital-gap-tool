use envconfig::Envconfig;
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize, Envconfig)]
pub struct Configs {
    #[envconfig(nested = true)]
    pub keycloak: KeycloakConfigs,
}

#[derive(Debug, Clone, Deserialize, Envconfig)]
pub struct KeycloakConfigs {
    #[envconfig(from = "KEYCLOAK_URL")]
    pub url: String,
    #[envconfig(from = "KEYCLOAK_REALM")]
    pub realm: String,
    #[envconfig(from = "KEYCLOAK_CLIENT_ID")]
    pub client_id: String,
}

impl Configs {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        dotenvy::dotenv().ok();
        Ok(Configs::init_from_env()?)
    }
}
