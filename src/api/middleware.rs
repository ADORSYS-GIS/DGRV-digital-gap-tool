// Middleware module for API
// This module will contain middleware functions for the API

use axum::{extract::Request, middleware::Next, response::Response};

/// CORS middleware
pub async fn cors_middleware(request: Request, next: Next) -> Response {
    // For now, just pass through the request
    // TODO: Implement proper CORS handling
    next.run(request).await
}

/// Authentication middleware
pub async fn auth_middleware(request: Request, next: Next) -> Response {
    // For now, just pass through the request
    // TODO: Implement proper authentication
    next.run(request).await
}
