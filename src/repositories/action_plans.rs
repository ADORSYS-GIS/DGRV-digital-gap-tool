use crate::{
    api::dto::action_plan::ActionPlanResponse,
    entities::{
        action_items, action_plans,
        dimension_assessments::{self},
        dimensions,
        recommendations::{self},
    },
    error::AppError,
};
use sea_orm::*;
use uuid::Uuid;

pub struct ActionPlansRepository;

impl ActionPlansRepository {
    pub async fn find_all(db: &DbConn) -> Result<Vec<action_plans::Model>, AppError> {
        action_plans::Entity::find()
            .all(db)
            .await
            .map_err(AppError::from)
    }

    pub async fn find_action_plan_with_items_by_assessment_id(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<Option<ActionPlanResponse>, AppError> {
        let plan_with_items = action_plans::Entity::find()
            .filter(action_plans::Column::AssessmentId.eq(assessment_id))
            .find_with_related(action_items::Entity)
            .all(db)
            .await?;

        if let Some((plan, items)) = plan_with_items.into_iter().next() {
            let recommendation_ids: Vec<Uuid> =
                items.iter().map(|item| item.recommendation_id).collect();

            let recommendations = recommendations::Entity::find()
                .filter(recommendations::Column::RecommendationId.is_in(recommendation_ids))
                .all(db)
                .await?;

            let recommendations_map: std::collections::HashMap<Uuid, recommendations::Model> =
                recommendations
                    .into_iter()
                    .map(|rec| (rec.recommendation_id, rec))
                    .collect();

            let dimension_assessment_ids: Vec<Uuid> = items
                .iter()
                .map(|item| item.dimension_assessment_id)
                .collect();

            let dimension_assessments = dimension_assessments::Entity::find()
                .filter(
                    dimension_assessments::Column::DimensionAssessmentId
                        .is_in(dimension_assessment_ids),
                )
                .all(db)
                .await?;

            let dimension_ids: Vec<Uuid> = dimension_assessments
                .iter()
                .map(|da| da.dimension_id)
                .collect();

            let dimensions = dimensions::Entity::find()
                .filter(dimensions::Column::DimensionId.is_in(dimension_ids))
                .all(db)
                .await?;

            let dimensions_map: std::collections::HashMap<Uuid, dimensions::Model> = dimensions
                .into_iter()
                .map(|dim| (dim.dimension_id, dim))
                .collect();

            let dimension_assessments_map: std::collections::HashMap<
                Uuid,
                (dimension_assessments::Model, Option<dimensions::Model>),
            > = dimension_assessments
                .into_iter()
                .map(|da| {
                    let dimension = dimensions_map.get(&da.dimension_id).cloned();
                    (da.dimension_assessment_id, (da, dimension))
                })
                .collect();

            let action_items_response = items
                .into_iter()
                .map(|item| {
                    let recommendation = recommendations_map.get(&item.recommendation_id).cloned();
                    let dimension_assessment_info = dimension_assessments_map
                        .get(&item.dimension_assessment_id)
                        .cloned();
                    (item, recommendation, dimension_assessment_info).into()
                })
                .collect();

            Ok(Some(ActionPlanResponse {
                action_plan_id: plan.id,
                assessment_id: plan.assessment_id,
                created_at: plan.created_at.into(),
                action_items: action_items_response,
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn find_or_create(
        db: &DbConn,
        assessment_id: Uuid,
    ) -> Result<action_plans::Model, AppError> {
        match action_plans::Entity::find()
            .filter(action_plans::Column::AssessmentId.eq(assessment_id))
            .one(db)
            .await?
        {
            Some(action_plan) => Ok(action_plan),
            None => {
                let new_action_plan = action_plans::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    assessment_id: Set(assessment_id),
                    ..Default::default()
                };
                new_action_plan.insert(db).await.map_err(AppError::from)
            }
        }
    }
}
