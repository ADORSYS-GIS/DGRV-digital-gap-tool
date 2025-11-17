# Authentication Middleware Module

This folder contains all the necessary files to implement the authentication middleware.

## Files

-   **`middleware.rs`**: Defines the Axum middleware for JWT validation.
-   **`jwt_validator.rs`**: Contains the logic for validating JWTs using `biscuit`.
-   **`claims.rs`**: Defines the `Claims` struct for deserializing the JWT claims.
-   **`config.rs`**: Provides the necessary Keycloak configurations for token validation.