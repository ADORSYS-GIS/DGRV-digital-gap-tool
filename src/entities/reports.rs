use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::fmt;
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "reports")]
pub struct Model {
    #[sea_orm(primary_key, auto_generate = false)]
    pub report_id: Uuid,
    pub assessment_id: Uuid,
    pub report_type: ReportType,
    pub title: String,
    pub format: ReportFormat,
    pub summary: Option<String>,
    pub report_data: Option<JsonValue>,
    pub file_path: Option<String>,
    pub status: ReportStatus,
    pub generated_at: DateTimeUtc,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "report_type")]
pub enum ReportType {
    #[sea_orm(string_value = "summary")]
    Summary,
    #[sea_orm(string_value = "detailed")]
    Detailed,
    #[sea_orm(string_value = "action_plan")]
    ActionPlan,
}

#[derive(
    Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize, ToSchema,
)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "report_format")]
pub enum ReportFormat {
    #[sea_orm(string_value = "pdf")]
    Pdf,
    #[sea_orm(string_value = "excel")]
    Excel,
    #[sea_orm(string_value = "json")]
    Json,
}

impl fmt::Display for ReportFormat {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ReportFormat::Pdf => write!(f, "pdf"),
            ReportFormat::Excel => write!(f, "excel"),
            ReportFormat::Json => write!(f, "json"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "report_status")]
pub enum ReportStatus {
    #[sea_orm(string_value = "pending")]
    Pending,
    #[sea_orm(string_value = "generating")]
    Generating,
    #[sea_orm(string_value = "completed")]
    Completed,
    #[sea_orm(string_value = "failed")]
    Failed,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::assessments::Entity",
        from = "Column::AssessmentId",
        to = "super::assessments::Column::AssessmentId",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Assessments,
}

impl Related<super::assessments::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Assessments.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
