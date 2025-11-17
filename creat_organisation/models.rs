use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use utoipa::ToSchema;

// =============== Organization Models ===============

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct OrganizationDomainRequest {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct OrganizationCreateRequest {
    pub name: String,
    pub domains: Vec<OrganizationDomainRequest>,
    #[serde(rename = "redirectUrl")]
    pub redirect_url: String,
    pub enabled: String, // Note: This comes as string in the payload sample
    pub attributes: Option<HashMap<String, Vec<String>>>,
}


#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct OrganizationUpdateRequest {
    pub name: String,
    pub domains: Vec<OrganizationDomainRequest>,
    pub attributes: Option<HashMap<String, Vec<String>>>,
}
