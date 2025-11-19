use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct AddMemberRequest {
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub roles: Vec<String>,
}