use anyhow::{anyhow, Result};
use biscuit::{jwa::SignatureAlgorithm, Validation, ValidationOptions, JWT};
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{error, info};

use crate::config::KeycloakConfigs;
use crate::auth::claims::{Claims, PrivateClaims};

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
        let token: JWT<PrivateClaims, biscuit::Empty> = JWT::new_encoded(token);

        let decoded_token = match token.decode_with_jwks(&jwks, Some(SignatureAlgorithm::RS256)) {
            Ok(t) => t,
            Err(e) => {
                error!("Token decoding failed: {}", e);
                return Err(anyhow!("Token decoding failed: {}", e));
            }
        };

        let validation_options = ValidationOptions {
            issuer: Validation::Validate(format!("{}/realms/{}", self.config.url, self.config.realm)),
            ..Default::default()
        };

        let expected_issuer = format!("{}/realms/{}", self.config.url, self.config.realm);
        let token_issuer = decoded_token.payload().ok().and_then(|p| p.registered.issuer.clone());

        // --- JWT ISSUER VALIDATION LOGS ---
        info!("[AUTH] Expected issuer: {}", expected_issuer);
        info!("[AUTH] Received issuer: {:?}", token_issuer.as_deref().unwrap_or("N/A"));
        // --- END LOGS ---

        if let Some(issuer) = token_issuer.as_deref() {
            if issuer != expected_issuer {
                error!("[AUTH] Issuer mismatch: expected '{}', got '{}'", expected_issuer, issuer);
                return Err(anyhow!("Token issuer mismatch"));
            }
        }

        decoded_token.validate(validation_options)?;

        let payload = decoded_token.payload()?;
        let private_claims = payload.private.clone();
        let subject = payload.registered.subject.clone().ok_or_else(|| anyhow!("Subject not found in token"))?;

        let claims = Claims {
            subject,
            realm_access: private_claims.realm_access,
            resource_access: private_claims.resource_access,
            preferred_username: private_claims.preferred_username,
            email: private_claims.email,
            name: private_claims.name,
        };

        Ok(claims)
    }
}