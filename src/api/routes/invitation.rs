use axum::{routing::post, Router};

use crate::{
    api::handlers::invitation::invite_user_to_organization, auth::middleware::auth_middleware as auth, AppState,
};

pub fn create_router(app_state: AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/organizations/:org_id/invitations",
            post(invite_user_to_organization),
        )
        .route_layer(axum::middleware::from_fn_with_state(
            app_state.clone(),
            auth,
        ))
        .with_state(app_state)
}