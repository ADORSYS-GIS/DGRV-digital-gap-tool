use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrganizationDomain {
    pub name: String,
    pub verified: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeycloakOrganization {
    pub id: String,
    pub name: String,
    pub alias: Option<String>,
    pub enabled: bool,
    pub description: Option<String>,
    #[serde(rename = "redirectUrl")]
    pub redirect_url: Option<String>,
    pub domains: Option<Vec<OrganizationDomain>>,
    pub attributes: Option<serde_json::Value>,
}


