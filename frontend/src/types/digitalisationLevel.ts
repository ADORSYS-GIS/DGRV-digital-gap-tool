import { OfflineEntity } from "./sync";
import {
  CreateCurrentStateRequest,
  CreateDesiredStateRequest,
} from "@/openapi-client/types.gen";

export type LevelType = "current" | "desired";
export type LevelState = number;

export interface IDigitalisationLevel extends OfflineEntity {
  dimensionId: string;
  levelType: LevelType;
  state: LevelState; // This corresponds to 'score' from API
  title: string;
  description: string | null;
  level?: string | null; // This is the 'level' string from API, not the numeric state
}

export interface ICreateCurrentStateRequest extends CreateCurrentStateRequest {
  id?: string; // Temporary ID for offline creation
  levelType: LevelType; // Add levelType for internal use
  level?: string | null;
  title: string;
}

export interface ICreateDesiredStateRequest extends CreateDesiredStateRequest {
  id?: string; // Temporary ID for offline creation
  levelType: LevelType; // Add levelType for internal use
  level?: string | null;
  title: string;
}
