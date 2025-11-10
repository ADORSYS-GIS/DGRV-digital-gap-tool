import { db } from "../db";
import {
  IDigitalisationGap,
  AddDigitalisationGapPayload,
  UpdateDigitalisationGapPayload,
  IDigitalisationGapWithDimension,
  scoreRanges,
} from "@/types/digitalisationGap";
import { IDimension } from "@/types/dimension";

export const digitalisationGapRepository = {
  async addDigitalisationGap(
    payload: AddDigitalisationGapPayload,
  ): Promise<void> {
    const newGap: IDigitalisationGap = {
      ...payload,
      id: crypto.randomUUID(),
      scoreRange: scoreRanges[payload.gap],
      isSynced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    };
    await db.digitalisationGaps.add(newGap);
  },

  async getDigitalisationGaps(): Promise<IDigitalisationGapWithDimension[]> {
    const allGaps = await db.digitalisationGaps.toArray();
    const gaps = allGaps.filter((gap) => !gap.isDeleted);
    const dimensions = await db.dimensions.toArray();
    const dimensionMap = new Map<string, IDimension>(
      dimensions.map((d) => [d.id, d]),
    );

    return gaps.map((gap) => ({
      ...gap,
      dimensionName:
        dimensionMap.get(gap.dimensionId)?.name || "Unknown Dimension",
    }));
  },

  async updateDigitalisationGap(
    payload: UpdateDigitalisationGapPayload,
  ): Promise<void> {
    const updateData: Partial<IDigitalisationGap> = {
      ...payload,
      isSynced: false,
      updatedAt: new Date().toISOString(),
    };

    if (payload.gap) {
      updateData.scoreRange = scoreRanges[payload.gap];
    }

    await db.digitalisationGaps.update(payload.id, updateData);
  },

  async deleteDigitalisationGap(id: string): Promise<void> {
    await db.digitalisationGaps.update(id, {
      isDeleted: true,
      isSynced: false,
      updatedAt: new Date().toISOString(),
    });
  },

  async getUnsyncedDigitalisationGaps(): Promise<IDigitalisationGap[]> {
    return db.digitalisationGaps.where("isSynced").equals(0).toArray();
  },

  async markDigitalisationGapsAsSynced(
    syncedGaps: { id: string; updatedAt: string }[],
  ): Promise<void> {
    const updates = syncedGaps.map(({ id, updatedAt }) =>
      db.digitalisationGaps.update(id, { isSynced: true, updatedAt }),
    );
    await Promise.all(updates);
  },
};
