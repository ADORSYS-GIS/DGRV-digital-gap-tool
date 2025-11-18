use axum::{
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
};
use axum_extra::headers::{authorization::Bearer, Authorization};
use axum_extra::TypedHeader;

use crate::AppState;

pub async fn auth_middleware(
    State(app_state): State<AppState>,
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
    mut request: Request<axum::body::Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    let token = auth.token();
    match app_state.jwt_validator.validate_token(token).await {
        Ok(claims) => {
            request.extensions_mut().insert(claims);
            request.extensions_mut().insert(token.to_string());
            Ok(next.run(request).await)
        }
        Err(_) => Err(StatusCode::UNAUTHORIZED),
    }
}