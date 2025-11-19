import { db } from "@/services/db";
import { Cooperation } from "@/types/cooperation";
import { v4 as uuidv4 } from "uuid";
import { cooperationSyncService } from "@/services/sync/cooperationSyncService";

export const cooperationRepository = {
  async getAll() {
    return await db.cooperations.toArray();
  },

  async getById(id: string) {
    return await db.cooperations.get(id);
  },

  async add(cooperation: Omit<Cooperation, "id" | "syncStatus">) {
    const newCooperation: Cooperation = {
      ...cooperation,
      id: uuidv4(),
      syncStatus: "new",
    };
    await db.cooperations.add(newCooperation);
    cooperationSyncService.sync();
    return newCooperation;
  },

  async update(
    id: string,
    updates: Partial<Omit<Cooperation, "id" | "syncStatus">>,
  ) {
    const cooperation = await db.cooperations.get(id);
    if (cooperation) {
      const updatedCooperation = {
        ...cooperation,
        ...updates,
        syncStatus: "updated" as const,
      };
      await db.cooperations.put(updatedCooperation);
      cooperationSyncService.sync();
      return updatedCooperation;
    }
  },

  async delete(id: string) {
    const cooperation = await db.cooperations.get(id);
    if (cooperation) {
      await db.cooperations.update(id, { syncStatus: "deleted" });
      cooperationSyncService.sync();
    }
  },
};
