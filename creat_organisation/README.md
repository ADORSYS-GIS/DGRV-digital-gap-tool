# Organization Creation Module

This folder contains all the necessary files to implement the organization creation functionality in another project.

## Files

-   **`routes.rs`**: Defines the API endpoints for managing organizations:
    -   `POST /api/admin/organizations`: Create a new organization.
    -   `GET /api/admin/organizations`: Get a list of all organizations.
    -   `GET /api/admin/organizations/{org_id}`: Get a specific organization by its ID.
    -   `PUT /api/admin/organizations/{org_id}`: Update an existing organization.
    -   `DELETE /api/admin/organizations/{org_id}`: Delete an organization.
-   **`organizations.rs`**: Contains the handler functions (`create_organization`, `get_organizations`, `get_organization`, `update_organization`, `delete_organization`) that process the requests.
-   **`models.rs`**: Defines the `OrganizationCreateRequest` and `OrganizationUpdateRequest` structs for the request bodies.
-   **`keycloak_service.rs`**: Implements the core logic for interacting with the Keycloak API to perform the CRUD operations.
-   **`keycloak.rs`**: Contains the data models for Keycloak entities, such as `KeycloakOrganization`.
-   **`config.rs`**: Provides the necessary Keycloak configurations.