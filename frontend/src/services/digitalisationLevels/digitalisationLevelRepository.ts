import { db } from "../db";
import { DigitalisationLevel, LevelType } from "@/types/digitalisationLevel";

export const digitalisationLevelRepository = {
  getByDimensionId: (dimensionId: string) =>
    db.digitalisationLevels.where({ dimensionId }).toArray(),
  getByDimensionIdAndType: (dimensionId: string, levelType: LevelType) =>
    db.digitalisationLevels
      .where({ dimensionId, levelType })
      .toArray(),
  add: (level: DigitalisationLevel) => db.digitalisationLevels.add(level),
  update: (id: string, changes: Partial<DigitalisationLevel>) =>
    db.digitalisationLevels.update(id, changes),
  delete: (id: string) => db.digitalisationLevels.delete(id),
};
