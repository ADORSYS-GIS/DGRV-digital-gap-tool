export interface AssessmentInput {
  perspective: string;
  currentLevel: string;
  toBeLevel: string;
  comment: string;
}

export interface GapResult {
  perspective: string;
  gapSeverity: number;
  recommendations: string[];
}

export interface SubmitAssessmentResponse {
  message: string;
  results: GapResult[];
}