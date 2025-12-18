use sea_orm::{ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::entities::assessments::{self, AssessmentStatus, Entity as Assessments};

pub async fn get_all_organization_submissions(
    db: &DatabaseConnection,
) -> Result<Vec<assessments::Model>, DbErr> {
    Assessments::find()
        .filter(assessments::Column::Status.eq(AssessmentStatus::Completed))
        .all(db)
        .await
}

pub async fn get_cooperative_submissions_by_organization(
    db: &DatabaseConnection,
    organization_id: Uuid,
) -> Result<Vec<assessments::Model>, DbErr> {
    Assessments::find()
        .filter(assessments::Column::OrganizationId.eq(organization_id.to_string()))
        .filter(assessments::Column::Status.eq(AssessmentStatus::Completed))
        .all(db)
        .await
}
