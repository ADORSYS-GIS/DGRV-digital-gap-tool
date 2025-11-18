import { OfflineEntity } from "./sync";

export interface Assessment extends OfflineEntity {
  name: string;
  dimensionIds?: string[];
  created_at: string;
  status: string;
}

export interface AssessmentDetails {
  assessment_id: string;
  organization_id: string;
  document_title: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  dimensions_id: string[];
}

export interface DimensionAssessmentSummary {
  dimension_assessment_id: string;
  assessment_id: string;
  dimension_id: string;
  current_state_id: string;
  desired_state_id: string;
  gap_score: number;
  gap_id: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentSummaryData {
  assessment: AssessmentDetails;
  dimension_assessments: DimensionAssessmentSummary[];
  gaps_count: number;
  recommendations_count: number;
  overall_score: number | null;
}

export interface AssessmentSummary
  extends OfflineEntity,
    AssessmentSummaryData {
  // id is from OfflineEntity and will be assessment.assessment_id
}
