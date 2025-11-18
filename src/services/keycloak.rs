use reqwest::{Client, StatusCode};
use serde::Deserialize;
use serde_json::json;
use tracing::{error, info};
use anyhow::{anyhow, Result};

use crate::api::dto::organization::{KeycloakOrganization, OrganizationDomain};
use crate::config::Config;

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
}

#[derive(Debug, Clone)]
pub struct KeycloakService {
    client: Client,
    config: Config,
}

impl KeycloakService {
    pub fn new(config: Config) -> Self {
        let client = Client::builder()
            .danger_accept_invalid_certs(true)
            .build()
            .expect("Failed to create reqwest client");

        Self { client, config }
    }

    /// Create a new organization
    pub async fn create_organization(
        &self,
        access_token: &str,
        name: &str,
        domains: Vec<crate::api::dto::organization::OrganizationDomainRequest>,
        redirect_url: String,
        enabled: String,
        attributes: Option<std::collections::HashMap<String, Vec<String>>>,
    ) -> Result<KeycloakOrganization> {
        let url = format!(
            "{}/admin/realms/{}/organizations",
            self.config.keycloak.url, self.config.keycloak.realm
        );
        info!(url = %url, "Constructed Keycloak URL");

        let mut new_attributes = attributes.clone().unwrap_or_default();
        new_attributes.insert("displayName".to_string(), vec![name.to_string()]);

        let payload = json!({
            "name": name,
            "domains": &domains,
            "redirectUrl": &redirect_url,
            "enabled": enabled == "true",
            "attributes": &new_attributes,
        });
        info!(payload = %payload, "Sending organization create payload to Keycloak");

        let response = self
            .client
            .post(&url)
            .bearer_auth(access_token)
            .json(&payload)
            .send()
            .await?;

        match response.status() {
            StatusCode::CREATED => {
                if let Some(location) = response.headers().get(reqwest::header::LOCATION) {
                    let location_str = location.to_str()?;
                    if let Some(id) = location_str.split('/').last() {
                        let created_org = KeycloakOrganization {
                            id: id.to_string(),
                            name: name.to_string(),
                            alias: None,
                            enabled: enabled == "true",
                            description: None,
                            redirect_url: Some(redirect_url),
                            domains: Some(
                                domains
                                    .into_iter()
                                    .map(|d| OrganizationDomain {
                                        name: d.name,
                                        verified: None,
                                    })
                                    .collect(),
                            ),
                            attributes: Some(serde_json::to_value(new_attributes).unwrap_or_default()),
                        };
                        info!(org_id = %id, "Successfully created organization in Keycloak");
                        Ok(created_org)
                    } else {
                        Err(anyhow!("Failed to parse organization ID from Location header"))
                    }
                } else {
                    Err(anyhow!("Keycloak returned 201 Created but no Location header was found"))
                }
            }
            StatusCode::NO_CONTENT => {
                tracing::warn!("Keycloak returned 204 No Content on organization creation, ID is not available.");
                let created_org = KeycloakOrganization {
                    id: String::new(),
                    name: name.to_string(),
                    alias: None,
                    enabled: enabled == "true",
                    description: None,
                    redirect_url: Some(redirect_url),
                    domains: Some(
                        domains
                            .into_iter()
                            .map(|d| OrganizationDomain {
                                name: d.name,
                                verified: None,
                            })
                            .collect(),
                    ),
                    attributes: Some(serde_json::to_value(new_attributes).unwrap_or_default()),
                };
                Ok(created_org)
            }
            _ => {
                let status = response.status();
                let error_text = response.text().await?;
                error!(status = %status, "Failed to create organization: {}", error_text);
                Err(anyhow!("Failed to create organization (status: {}): {}", status, error_text))
            }
        }
    }

    /// Get all organizations
    pub async fn get_organizations(&self, access_token: &str) -> Result<Vec<KeycloakOrganization>> {
        let url = format!(
            "{}/admin/realms/{}/organizations?briefRepresentation=false",
            self.config.keycloak.url, self.config.keycloak.realm
        );
        info!(url = %url, "Constructed Keycloak URL");

        let response = self
            .client
            .get(&url)
            .bearer_auth(access_token)
            .send()
            .await?
            .error_for_status()?;

        let response_text = response.text().await?;
        tracing::warn!("Raw Keycloak response: {}", response_text);

        let mut orgs: Vec<KeycloakOrganization> = serde_json::from_str(&response_text)?;
        for org in &mut orgs {
            if let Some(attributes) = org.attributes.as_mut() {
                if let Some(serde_json::Value::Array(display_name_vec)) = attributes.get("displayName") {
                    if let Some(serde_json::Value::String(display_name)) = display_name_vec.get(0) {
                        org.name = display_name.clone();
                    }
                }
            }
        }
        tracing::warn!("Deserialized organizations: {:?}", orgs);
        Ok(orgs)
    }

    /// Get a specific organization by ID
    pub async fn get_organization(
        &self,
        access_token: &str,
        org_id: &str,
    ) -> Result<KeycloakOrganization> {
        let url = format!(
            "{}/admin/realms/{}/organizations/{}?briefRepresentation=false",
            self.config.keycloak.url, self.config.keycloak.realm, org_id
        );
        info!(url = %url, "Constructed Keycloak URL");

        let response = self
            .client
            .get(&url)
            .bearer_auth(access_token)
            .send()
            .await?
            .error_for_status()?;

        let response_text = response.text().await?;
        tracing::warn!("Raw single organization response: {}", response_text);

        let mut org: KeycloakOrganization = serde_json::from_str(&response_text)?;
        if let Some(attributes) = org.attributes.as_mut() {
            if let Some(serde_json::Value::Array(display_name_vec)) = attributes.get("displayName") {
                if let Some(serde_json::Value::String(display_name)) = display_name_vec.get(0) {
                    org.name = display_name.clone();
                }
            }
        }
        tracing::warn!("Deserialized single organization: {:?}", org);
        Ok(org)
    }

    /// Update an organization
    pub async fn update_organization(
        &self,
        access_token: &str,
        org_id: &str,
        name: &str,
        domains: Vec<crate::api::dto::organization::OrganizationDomainRequest>,
        attributes: Option<std::collections::HashMap<String, Vec<String>>>,
    ) -> Result<()> {
        let url = format!(
            "{}/admin/realms/{}/organizations/{}",
            self.config.keycloak.url, self.config.keycloak.realm, org_id
        );
        info!(url = %url, "Constructed Keycloak URL");

        let mut new_attributes = attributes.unwrap_or_default();
        // The 'name' field is treated as an immutable alias by Keycloak on update.
        // To change the display name, we set it as a 'displayName' attribute.
        new_attributes.insert("displayName".to_string(), vec![name.to_string()]);

        let payload = json!({
            "domains": domains,
            "attributes": new_attributes,
        });

        let response = self
            .client
            .put(&url)
            .bearer_auth(access_token)
            .json(&payload)
            .send()
            .await?;

        match response.status() {
            StatusCode::NO_CONTENT => Ok(()),
            _ => {
                let status = response.status();
                let error_text = response.text().await?;
                error!(status = %status, "Failed to update organization: {}", error_text);
                Err(anyhow!("Failed to update organization (status: {}): {}", status, error_text))
            }
        }
    }

    /// Delete an organization
    pub async fn delete_organization(&self, access_token: &str, org_id: &str) -> Result<()> {
        let url = format!(
            "{}/admin/realms/{}/organizations/{}",
            self.config.keycloak.url, self.config.keycloak.realm, org_id
        );
        info!(url = %url, "Constructed Keycloak URL");

        let response = self
            .client
            .delete(&url)
            .bearer_auth(access_token)
            .send()
            .await?;

        match response.status() {
            StatusCode::NO_CONTENT => Ok(()),
            _ => {
                let status = response.status();
                let error_text = response.text().await?;
                error!(status = %status, "Failed to delete organization: {}", error_text);
                Err(anyhow!("Failed to delete organization (status: {}): {}", status, error_text))
            }
        }
    }
}