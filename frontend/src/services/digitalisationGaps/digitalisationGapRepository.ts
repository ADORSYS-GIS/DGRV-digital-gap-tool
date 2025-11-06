import { db } from "@/services/db";
import { Gap } from "@/types/gap";
import { SyncStatus } from "@/types/sync";

export const digitalisationGapRepository = {
  async getAll(): Promise<Gap[]> {
    return db.digitalisationGaps.toArray();
  },

  async getById(id: string): Promise<Gap | undefined> {
    return db.digitalisationGaps.get(id);
  },

  async add(gap: Omit<Gap, "id">): Promise<Gap> {
    const newGap: Gap = {
      ...gap,
      id: crypto.randomUUID(),
      syncStatus: "pending",
    };
    await db.digitalisationGaps.add(newGap);
    return newGap;
  },

  async update(id: string, updates: Partial<Gap>): Promise<void> {
    await db.digitalisationGaps.update(id, {
      ...updates,
      syncStatus: "pending",
    });
  },

  async remove(id: string): Promise<void> {
    await db.digitalisationGaps.delete(id);
  },

  async bulkPut(gaps: Gap[]): Promise<void> {
    await db.digitalisationGaps.bulkPut(gaps);
  },
};