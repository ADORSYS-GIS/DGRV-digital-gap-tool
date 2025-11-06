import { OfflineEntity } from "./sync";
import { CreateCurrentStateRequest, CreateDesiredStateRequest } from "@/openapi-client/types.gen";

export type LevelType = "current" | "desired";
export type LevelState = 1 | 2 | 3 | 4 | 5;

export interface IDigitalisationLevel extends OfflineEntity {
  dimensionId: string;
  levelType: LevelType;
  state: LevelState; // This corresponds to 'score' from API
  title: string;
  description?: string | null;
  level?: string | null; // This is the 'level' string from API, not the numeric state
  characteristics?: string | null; // Specific to CurrentState
  success_criteria?: string | null; // Specific to DesiredState
  target_date?: string | null; // Specific to DesiredState
}

export interface ICreateCurrentStateRequest extends CreateCurrentStateRequest {
  id?: string; // Temporary ID for offline creation
  levelType: LevelType; // Add levelType for internal use
}

export interface ICreateDesiredStateRequest extends CreateDesiredStateRequest {
  id?: string; // Temporary ID for offline creation
  levelType: LevelType; // Add levelType for internal use
}
