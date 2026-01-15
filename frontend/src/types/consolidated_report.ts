export interface RiskLevelDistribution {
  high_risk_percentage: number;
  medium_risk_percentage: number;
  low_risk_percentage: number;
}

export interface DimensionSummary {
  dimension_name: string;
  average_risk_level: number;
  average_gap_score: number;
  risk_level_distribution: RiskLevelDistribution;
  top_recommendations: string[];
}

export interface ConsolidatedReport {
  total_entities_analyzed: number;
  total_submissions: number;
  overall_average_risk_level: number;
  overall_average_gap_score: number;
  dimension_summaries: DimensionSummary[];
}
