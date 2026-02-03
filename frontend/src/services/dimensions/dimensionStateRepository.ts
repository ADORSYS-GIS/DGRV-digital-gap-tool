import { db } from "../db";
import { IDimensionState } from "@/types/dimension";
import { IDigitalisationLevel } from "@/types/digitalisationLevel";

export const dimensionStateRepository = {
  getAll: async (): Promise<IDimensionState[]> => {
    const levels = await db.digitalisationLevels.toArray();
    return levels.map((level: IDigitalisationLevel) => ({
      id: level.id,
      dimensionId: level.dimensionId,
      level: level.state,
      name: level.title,
      description: level.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },
};
