use crate::common::config::KeycloakConfigs;
use crate::common::models::keycloak::*;
use anyhow::{anyhow, Result};
use reqwest::{Client, StatusCode};
use serde_json::json;
use tracing::{debug, error, info, warn};
use serde::Deserialize;

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
}

#[derive(Debug, Clone)]
pub struct KeycloakService {
    client: Client,
    config: KeycloakConfigs,
}

impl KeycloakService {
    pub fn new(config: KeycloakConfigs) -> Self {
        let client = Client::builder()
            .danger_accept_invalid_certs(true)
            .build().expect("Failed to create reqwest client");

        Self { client, config }
    }

    /// Create a new organization
    pub async fn create_organization(&self,
                                     admin_token: &str,
                                     name: &str,
                                     domains: Vec<crate::web::api::models::OrganizationDomainRequest>,
                                     redirect_url: String,
                                     enabled: String,
                                     attributes: Option<std::collections::HashMap<String, Vec<String>>>
    ) -> Result<KeycloakOrganization> {
        let url = format!("{}/admin/realms/{}/organizations", self.config.url, self.config.realm);

        let mut payload = json!({
            "name": name,
            "domains": domains,
            "redirectUrl": redirect_url,
            "enabled": enabled == "true",
        });
        if let Some(attrs) = &attributes {
            payload["attributes"] = json!(attrs);
        }
        info!(payload = %payload, "Sending organization create payload to Keycloak");

        let response = self.client.post(&url)
            .bearer_auth(admin_token)
            .json(&payload)
            .send()
            .await?;

        match response.status() {
            StatusCode::CREATED | StatusCode::NO_CONTENT => {
                let text = response.text().await?;
                tracing::warn!("Create organization response: {}", text);
                if !text.trim().is_empty() {
                    let org: KeycloakOrganization = serde_json::from_str(&text)?;
                    tracing::warn!("Created organization: {:?}", org);
                    Ok(org)
                } else {
                    // If no body, return a minimal KeycloakOrganization with only the name and domains
                    let created_org = KeycloakOrganization {
                        id: String::new(),
                        name: name.to_string(),
                        alias: None,
                        enabled: enabled == "true",
                        description: None,
                        redirect_url: Some(redirect_url),
                        domains: Some(domains.into_iter().map(|d| OrganizationDomain { name: d.name, verified: None }).collect()),
                        attributes: attributes.map(|attrs| serde_json::to_value(attrs).unwrap_or_default()),
                    };
                    tracing::warn!("Created organization (no response body): {:?}", created_org);
                    Ok(created_org)
                }
            },
            _ => {
                let error_text = response.text().await?;
                error!("Failed to create organization: {}", error_text);
                Err(anyhow!("Failed to create organization: {}", error_text))
            }
        }
    }

    /// Get all organizations
    pub async fn get_organizations(&self, token: &str) -> Result<Vec<KeycloakOrganization>> {
        let url = format!("{}/admin/realms/{}/organizations?briefRepresentation=false", self.config.url, self.config.realm);

        let response = self.client.get(&url)
            .bearer_auth(token)
            .send()
            .await?
            .error_for_status()?;

        let response_text = response.text().await?;
        tracing::warn!("Raw Keycloak response: {}", response_text);
        
        let orgs: Vec<KeycloakOrganization> = serde_json::from_str(&response_text)?;
        tracing::warn!("Deserialized organizations: {:?}", orgs);
        Ok(orgs)
    }

    /// Get a specific organization by ID
    pub async fn get_organization(&self, token: &str, org_id: &str) -> Result<KeycloakOrganization> {
        let url = format!("{}/admin/realms/{}/organizations/{}?briefRepresentation=false", self.config.url, self.config.realm, org_id);

        let response = self.client.get(&url)
            .bearer_auth(token)
            .send()
            .await?
            .error_for_status()?;

        let response_text = response.text().await?;
        tracing::warn!("Raw single organization response: {}", response_text);
        
        let org: KeycloakOrganization = serde_json::from_str(&response_text)?;
        tracing::warn!("Deserialized single organization: {:?}", org);
        Ok(org)
    }

    /// Update an organization
    pub async fn update_organization(&self,
                                     token: &str,
                                     org_id: &str,
                                     name: &str,
                                     domains: Vec<crate::web::api::models::OrganizationDomainRequest>,
                                     attributes: Option<std::collections::HashMap<String, Vec<String>>>
    ) -> Result<()> {
        let url = format!("{}/admin/realms/{}/organizations/{}", self.config.url, self.config.realm, org_id);

        let mut payload = json!({
            "name": name,
            "domains": domains,
        });

        if let Some(attrs) = attributes {
            payload["attributes"] = json!(attrs);
        }

        let response = self.client.put(&url)
            .bearer_auth(token)
            .json(&payload)
            .send()
            .await?;

        match response.status() {
            StatusCode::NO_CONTENT => Ok(()),
            _ => {
                let error_text = response.text().await?;
                error!("Failed to update organization: {}", error_text);
                Err(anyhow!("Failed to update organization: {}", error_text))
            }
        }
    }

    /// Delete an organization
    pub async fn delete_organization(&self, token: &str, org_id: &str) -> Result<()> {
        let url = format!("{}/admin/realms/{}/organizations/{}", self.config.url, self.config.realm, org_id);

        let response = self.client.delete(&url)
            .bearer_auth(token)
            .send()
            .await?;

        match response.status() {
            StatusCode::NO_CONTENT => Ok(()),
            _ => {
                let error_text = response.text().await?;
                error!("Failed to delete organization: {}", error_text);
                Err(anyhow!("Failed to delete organization: {}", error_text))
            }
        }
    }

}

