use anyhow::{anyhow, Result};
use biscuit::{jwa::SignatureAlgorithm, jws::Secret, ValidationOptions, JWT};
use serde::de::DeserializeOwned;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{error, info};

use crate::common::config::KeycloakConfigs;
use crate::common::models::claims::Claims;

#[derive(Debug, Clone)]
pub struct JwtValidator {
    config: KeycloakConfigs,
    jwks: Arc<RwLock<Option<biscuit::jwk::JWKSet<biscuit::Empty>>>>,
}

impl JwtValidator {
    pub fn new(config: KeycloakConfigs) -> Self {
        Self {
            config,
            jwks: Arc::new(RwLock::new(None)),
        }
    }

    async fn get_jwks(&self) -> Result<biscuit::jwk::JWKSet<biscuit::Empty>> {
        let mut jwks_guard = self.jwks.write().await;
        if let Some(jwks) = jwks_guard.clone() {
            return Ok(jwks);
        }

        let oidc_config_url = format!(
            "{}/realms/{}/.well-known/openid-configuration",
            self.config.url, self.config.realm
        );
        let oidc_config: serde_json::Value = reqwest::get(&oidc_config_url).await?.json().await?;
        let jwks_uri = oidc_config["jwks_uri"]
            .as_str()
            .ok_or_else(|| anyhow!("jwks_uri not found in OIDC config"))?;

        info!("Fetching JWKS from {}", jwks_uri);
        let fetched_jwks: biscuit::jwk::JWKSet<biscuit::Empty> =
            reqwest::get(jwks_uri).await?.json().await?;
        *jwks_guard = Some(fetched_jwks.clone());
        Ok(fetched_jwks)
    }

    pub async fn validate_token(&self, token: &str) -> Result<Claims> {
        let jwks = self.get_jwks().await?;
        let token: JWT<Claims, biscuit::Empty> = JWT::new_encoded(token);
        let key_id = token
            .unverified_header()?
            .key_id
            .as_ref()
            .ok_or_else(|| anyhow!("Token does not have a `kid` header field"))?
            .clone();

        let public_key = jwks
            .find(&key_id)
            .ok_or_else(|| anyhow!("No matching key found in JWKSet"))?;

        let secret = match &public_key.algorithm {
            biscuit::jwk::AlgorithmParameters::RSA(rsa) => {
                Secret::RsaKeyPair(Arc::new(rsa.clone()))
            }
            _ => return Err(anyhow!("Unsupported algorithm")),
        };

        let decoded_token = match token.decode(&secret, SignatureAlgorithm::RS256) {
            Ok(t) => t,
            Err(e) => {
                error!("Token decoding failed: {}", e);
                return Err(anyhow!("Token decoding failed"));
            }
        };

        let validation_options = ValidationOptions {
            issuer: Some(format!("{}/realms/{}", self.config.url, self.config.realm).into()),
            ..Default::default()
        };

        decoded_token.validate(validation_options)?;
        let claims = decoded_token.payload()?.clone();
        Ok(claims)
    }
}