use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Serialize, Deserialize, ToSchema)]
pub struct AssignDimensionRequest {
    pub dimension_ids: Vec<Uuid>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct UpdateOrganisationDimensionsRequest {
    pub dimension_ids: Vec<Uuid>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct OrganisationDimensionResponse {
    pub organisation_dimension: Uuid,
    pub organisation_id: String,
    pub dimension_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<crate::entities::organisation_dimension::Model> for OrganisationDimensionResponse {
    fn from(model: crate::entities::organisation_dimension::Model) -> Self {
        Self {
            organisation_dimension: model.organisation_dimension,
            organisation_id: model.organisation_id,
            dimension_id: model.dimension_id,
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}