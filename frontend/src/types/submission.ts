export interface Submission {
  id?: string;
  assessmentId: string;
  assessmentName?: string;
  dimensionId: string;
  currentLevel: number;
  toBeLevel: number;
  gap: number;
  gapScore: string;
  comments?: string;
  recommendations: string[];
  createdAt?: string;
  updatedAt?: string;
}