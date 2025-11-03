import { OfflineEntity } from "./sync";

export type LevelType = "current" | "desired";
export type LevelState = 1 | 2 | 3 | 4 | 5;

export interface DigitalisationLevel extends OfflineEntity {
  dimensionId: string;
  levelType: LevelType;
  state: LevelState;
  scope: string;
}
