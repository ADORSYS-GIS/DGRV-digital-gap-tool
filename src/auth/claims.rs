use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Represents the private claims portion of the JWT from Keycloak.
/// This struct is used for deserialization.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PrivateClaims {
    #[serde(rename = "realm_access")]
    pub realm_access: Option<RealmAccess>,
    #[serde(rename = "resource_access")]
    pub resource_access: Option<HashMap<String, RealmAccess>>,
    #[serde(rename = "preferred_username")]
    pub preferred_username: String,
    #[serde(rename = "email")]
    pub email: String,
    #[serde(rename = "name")]
    pub name: String,
}

/// Represents the combined claims (registered + private) to be used
/// within the application, for example in request extensions.
#[derive(Debug, Clone)]
pub struct Claims {
    pub subject: String,
    pub realm_access: Option<RealmAccess>,
    pub resource_access: Option<HashMap<String, RealmAccess>>,
    pub preferred_username: String,
    pub email: String,
    pub name: String,
}


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RealmAccess {
    pub roles: Vec<String>,
}

impl Claims {
    pub fn is_application_admin(&self) -> bool {
        self.has_realm_role("dgat_admin")
    }

    pub fn has_realm_role(&self, role: &str) -> bool {
        if let Some(realm_access) = &self.realm_access {
            return realm_access.roles.iter().any(|r| r == role);
        }
        false
    }
}