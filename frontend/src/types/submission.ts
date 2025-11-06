export interface Submission {
  id?: string;
  assessmentId: string;
  dimensionId: string;
  currentLevel: number;
  desiredLevel: number;
  gap: number;
  gapScore: string;
  comments?: string;
}