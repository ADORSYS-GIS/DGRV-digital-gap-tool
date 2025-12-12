use crate::api::handlers::assessment::{
    create_assessment, create_dimension_assessment, delete_assessment,
    delete_organization_assessment, get_assessment, get_assessment_summary, list_assessments,
    list_assessments_by_cooperation, list_assessments_by_organization,
    list_dimension_assessments, list_submissions_by_cooperation,
    list_submissions_by_organization, update_assessment, update_dimension_assessment,
};
use axum::{
    routing::{delete, get, post, put},
    Router,
};

use crate::AppState;

pub fn assessment_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_assessment).get(list_assessments))
        .route(
            "/:assessment_id",
            get(get_assessment)
                .put(update_assessment)
                .delete(delete_assessment),
        )
        .route("/:assessment_id/summary", get(get_assessment_summary))
        .route(
            "/:assessment_id/dimension-assessments",
            post(create_dimension_assessment).get(list_dimension_assessments),
        )
        .route(
            "/:assessment_id/dimension-assessments/:dimension_assessment_id",
            put(update_dimension_assessment),
        )
        .route(
            "/organizations/:organization_id",
            get(list_assessments_by_organization),
        )
        .route(
            "/organizations/:organization_id/submissions",
            get(list_submissions_by_organization),
        )
        .route(
            "/organizations/:organization_id/:assessment_id",
            delete(delete_organization_assessment),
        )
        .route(
            "/cooperations/:cooperation_id",
            get(list_assessments_by_cooperation),
        )
        .route(
            "/cooperations/:cooperation_id/submissions",
            get(list_submissions_by_cooperation),
        )
}
