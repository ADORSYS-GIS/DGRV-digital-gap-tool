import { db } from "../db";
import { IDigitalisationLevel, ICreateCurrentStateRequest, ICreateDesiredStateRequest, LevelType, LevelState } from "@/types/digitalisationLevel";
import { v4 as uuidv4 } from "uuid";
import { SyncStatus } from "@/types/sync/index";

export const digitalisationLevelRepository = {
  getByDimensionId: (dimensionId: string) =>
    db.digitalisationLevels.where({ dimensionId }).toArray(),

  add: async (
    level: ICreateCurrentStateRequest | ICreateDesiredStateRequest
  ): Promise<IDigitalisationLevel> => {
    const newLevel: IDigitalisationLevel = {
      id: level.id || uuidv4(),
      syncStatus: SyncStatus.PENDING, // Corrected to PENDING
      dimensionId: level.dimension_id,
      levelType: level.levelType,
      state: level.score as LevelState, // Map score to state
      title: level.title,
      description: level.description ?? null,
      level: level.level ?? null,
      ...(level.levelType === "current" && {
        characteristics: (level as ICreateCurrentStateRequest).characteristics ?? null,
      }),
      ...(level.levelType === "desired" && {
        success_criteria: (level as ICreateDesiredStateRequest).success_criteria ?? null,
        target_date: (level as ICreateDesiredStateRequest).target_date ?? null,
      }),
    };
    await db.digitalisationLevels.add(newLevel);
    // Removed syncService.addToSyncQueue call
    return newLevel;
  },

};
