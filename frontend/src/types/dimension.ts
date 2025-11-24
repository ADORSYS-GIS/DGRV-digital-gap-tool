import { OfflineEntity } from "@/types/sync/index";

export interface IDimension extends OfflineEntity {
  name: string;
  description?: string | null;
  category?: string | null;
  weight?: number | null;
  is_active?: boolean | null;
}

export interface ICreateDimensionRequest {
  name: string;
  description?: string | null;
  weight?: number | null;
  id?: string; // Temporary ID for offline creation
}

export interface IDimensionState {
  id: string;
  dimensionId: string;
  level: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDimensionWithStates extends IDimension {
  currentState?: IDimensionState | null;
  desiredState?: IDimensionState | null;
  states?: IDimensionState[];
  current_states?: IDimensionState[];
  desired_states?: IDimensionState[];
}

export interface ISubmitDimensionAssessmentRequest {
  dimensionId: string;
  assessmentId: string;
  currentStateId: string;
  desiredStateId: string;
  gapScore: number;
  // The following are for offline storage and UI purposes
  currentLevel: number;
  desiredLevel: number;
}

export interface IDimensionAssessmentResponse {
  id: string;
  dimensionId: string;
  assessmentId: string;
  currentState: IDimensionState;
  desiredState: IDimensionState;
  createdAt: string;
  updatedAt: string;
  gap_id?: string;
}

export interface IDimensionAssessment
  extends Omit<IDimensionAssessmentResponse, "id"> {
  id: string;
  syncStatus: string;
  lastError?: string;
  gap_id?: string;
}
