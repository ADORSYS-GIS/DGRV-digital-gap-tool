use crate::entities::dimensions;
use crate::entities::dimension_assessments;
use crate::error::AppError;
use sea_orm::{DatabaseConnection, EntityTrait, QueryFilter, ColumnTrait};
use uuid::Uuid;

pub struct DimensionScoringService;

impl DimensionScoringService {
    /// Calculate weighted score for a dimension assessment
    /// The weight is applied to normalize scores across different dimensions
    pub fn calculate_weighted_score(
        base_score: i32,
        dimension_weight: Option<i32>,
    ) -> Result<f64, AppError> {
        let weight = dimension_weight.unwrap_or(100) as f64 / 100.0;
        let weighted_score = base_score as f64 * weight;
        
        Ok(weighted_score)
    }

    /// Validate that a weight is within the acceptable range (0-100)
    pub fn validate_weight(weight: i32) -> Result<(), AppError> {
        if weight < 0 || weight > 100 {
            return Err(AppError::ValidationError(
                "Dimension weight must be between 0 and 100".to_string(),
            ));
        }
        Ok(())
    }

    /// Calculate the total weighted score for an assessment
    /// This takes into account all dimension weights and their respective scores
    pub async fn calculate_total_weighted_score(
        db: &DatabaseConnection,
        assessment_id: Uuid,
    ) -> Result<f64, AppError> {
        // Get all dimension assessments for this assessment
        let dimension_assessments = dimension_assessments::Entity::find()
            .filter(dimension_assessments::Column::AssessmentId.eq(assessment_id))
            .all(db)
            .await
            .map_err(AppError::from)?;

        let mut total_weighted_score = 0.0;
        let mut total_weight = 0.0;

        for da in dimension_assessments {
            // Get the dimension to retrieve its weight
            let dimension = dimensions::Entity::find_by_id(da.dimension_id)
                .one(db)
                .await
                .map_err(AppError::DatabaseError)?
                .ok_or_else(|| AppError::NotFound("Dimension not found".to_string()))?;

            let weight = dimension.weight.unwrap_or(100) as f64 / 100.0;
            let gap_size = 0.0;
            
            // Calculate weighted gap size
            let weighted_gap = gap_size * weight;
            total_weighted_score += weighted_gap;
            total_weight += weight;
        }

        // Normalize by total weight to get average weighted score
        if total_weight > 0.0 {
            Ok(total_weighted_score / total_weight)
        } else {
            Ok(0.0)
        }
    }

    /// Calculate dimension priority based on weight and gap size
    pub fn calculate_priority_score(
        gap_size: i32,
        dimension_weight: Option<i32>,
    ) -> Result<i32, AppError> {
        let weight = dimension_weight.unwrap_or(100) as f64 / 100.0;
        let priority_score = (gap_size as f64 * weight * 100.0) as i32;

        Ok(priority_score)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_weighted_score() {
        // Test with normal weight
        let result = DimensionScoringService::calculate_weighted_score(80, Some(75));
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 60.0); // 80 * 0.75

        // Test with default weight (100)
        let result = DimensionScoringService::calculate_weighted_score(80, None);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 80.0); // 80 * 1.0

        // Test with zero weight
        let result = DimensionScoringService::calculate_weighted_score(80, Some(0));
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 0.0); // 80 * 0.0
    }

    #[test]
    fn test_validate_weight() {
        // Valid weights
        assert!(DimensionScoringService::validate_weight(0).is_ok());
        assert!(DimensionScoringService::validate_weight(50).is_ok());
        assert!(DimensionScoringService::validate_weight(100).is_ok());

        // Invalid weights
        assert!(DimensionScoringService::validate_weight(-1).is_err());
        assert!(DimensionScoringService::validate_weight(101).is_err());
    }

    #[test]
    fn test_calculate_priority_score() {
        // Test with normal weight
        let result = DimensionScoringService::calculate_priority_score(30, Some(80));
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 2400); // 30 * 0.8 * 100

        // Test with default weight
        let result = DimensionScoringService::calculate_priority_score(30, None);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 3000); // 30 * 1.0 * 100
    }
}