use serde::{Deserialize, Deserializer, Serialize};
use std::collections::HashMap;

// Helper struct to parse the nested organization ID
#[derive(Debug, Deserialize, Serialize, Clone)]
struct KeycloakOrganizationDetails {
    pub id: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct KeycloakOrganizations {
    pub dgrv: KeycloakOrganizationDetails,
}

/// Represents the private claims portion of the JWT from Keycloak.
/// This struct is used for deserialization.
#[derive(Debug, Serialize, Clone)] // Removed Deserialize here, we'll implement it manually
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
    pub organization_id: Option<String>,
}

// Manual Deserialize implementation for PrivateClaims
impl<'de> Deserialize<'de> for PrivateClaims {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        #[derive(Debug, Deserialize)]
        struct TempPrivateClaims {
            #[serde(rename = "realm_access")]
            realm_access: Option<RealmAccess>,
            #[serde(rename = "resource_access")]
            resource_access: Option<HashMap<String, RealmAccess>>,
            #[serde(rename = "preferred_username")]
            preferred_username: String,
            #[serde(rename = "email")]
            email: String,
            #[serde(rename = "name")]
            name: String,
            // This will capture the 'organizations' object
            organizations: Option<KeycloakOrganizations>,
            // We can also keep the original organization_id field if it might exist sometimes
            organization_id: Option<String>,
        }

        let temp_claims = TempPrivateClaims::deserialize(deserializer)?;

        let organization_id = temp_claims.organizations.map(|orgs| orgs.dgrv.id)
            .or(temp_claims.organization_id); // Fallback to direct organization_id if organizations is not present

        Ok(PrivateClaims {
            realm_access: temp_claims.realm_access,
            resource_access: temp_claims.resource_access,
            preferred_username: temp_claims.preferred_username,
            email: temp_claims.email,
            name: temp_claims.name,
            organization_id,
        })
    }
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
    pub organization_id: Option<String>,
}


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RealmAccess {
    pub roles: Vec<String>,
}

impl Claims {
    pub fn is_application_admin(&self) -> bool {
        self.has_realm_role("dgrv_admin")
    }

    pub fn has_realm_role(&self, role: &str) -> bool {
        if let Some(realm_access) = &self.realm_access {
            return realm_access.roles.iter().any(|r| r == role);
        }
        false
    }
    pub fn get_organization_id(&self) -> Option<String> {
        self.organization_id.clone()
    }
}