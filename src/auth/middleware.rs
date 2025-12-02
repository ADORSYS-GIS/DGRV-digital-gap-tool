use axum::{
    extract::State,
    http::{header::AUTHORIZATION, HeaderMap, Request, StatusCode},
    middleware::Next,
    response::Response,
};
use tracing::{error, info};

use crate::AppState;

pub async fn auth_middleware(
    State(app_state): State<AppState>,
    headers: HeaderMap,
    mut request: Request<axum::body::Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    info!("[AUTH_MIDDLEWARE] --- Auth Middleware Start ---");

    let auth_header = if let Some(header) = headers.get(AUTHORIZATION) {
        info!("[AUTH_MIDDLEWARE] Authorization header found.");
        header.to_str().ok()
    } else {
        error!("[AUTH_MIDDLEWARE] Authorization header missing.");
        return Err(StatusCode::UNAUTHORIZED);
    };

    let token = if let Some(header_value) = auth_header {
        info!("[AUTH_MIDDLEWARE] Authorization header value: '{}'", header_value);
        if let Some(token) = header_value.strip_prefix("Bearer ") {
            info!("[AUTH_MIDDLEWARE] Bearer token extracted successfully.");
            token
        } else {
            error!("[AUTH_MIDDLEWARE] 'Bearer ' prefix missing from Authorization header.");
            return Err(StatusCode::UNAUTHORIZED);
        }
    } else {
        error!("[AUTH_MIDDLEWARE] Authorization header contains non-ASCII characters.");
        return Err(StatusCode::UNAUTHORIZED);
    };

    info!("[AUTH_MIDDLEWARE] Attempting to validate token...");
    match app_state.jwt_validator.validate_token(token).await {
        Ok(claims) => {
            info!("[AUTH_MIDDLEWARE] Token validation successful.");
            request.extensions_mut().insert(claims);
            request.extensions_mut().insert(token.to_string());
            info!("[AUTH_MIDDLEWARE] --- Auth Middleware End ---");
            Ok(next.run(request).await)
        }
        Err(e) => {
            error!("[AUTH_MIDDLEWARE] Token validation failed: {}", e);
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}