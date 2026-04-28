use axum::{routing::{delete, get, post}, Router};

use crate::{
    api::handlers::invitation::{
        delete_organization_invitation, get_organization_invitations,
        invite_user_to_organization, resend_organization_invitation,
    },
    auth::middleware::auth_middleware as auth, AppState,
};

pub fn create_router(app_state: AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/organizations/:org_id/invitations",
            post(invite_user_to_organization).get(get_organization_invitations),
        )
        .route(
            "/organizations/:org_id/invitations/:invitation_id",
            delete(delete_organization_invitation),
        )
        .route(
            "/organizations/:org_id/invitations/:invitation_id/resend",
            post(resend_organization_invitation),
        )
        .route_layer(axum::middleware::from_fn_with_state(
            app_state.clone(),
            auth,
        ))
        .with_state(app_state)
}