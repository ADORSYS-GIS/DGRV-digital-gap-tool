import { db } from "@/services/db";
import { Cooperation } from "@/types/cooperation";
import { SyncStatus } from "@/types/sync";
import { v4 as uuidv4 } from "uuid";
import { cooperationSyncService } from "@/services/sync/cooperationSyncService";
import { getGroupByPath } from "@/openapi-client";

export const cooperationRepository = {
  async getAll(organizationId?: string) {
    if (organizationId) {
      await cooperationSyncService.sync(organizationId);
    }
    return await db.cooperations.toArray();
  },

  async getById(id: string) {
    return await db.cooperations.get(id);
  },

  async getByPath(path: string): Promise<Cooperation | undefined> {
    // Offline: look up from local IndexedDB by path
    if (!navigator.onLine) {
      const local = await db.cooperations.filter((c) => c.path === path).first();
      return local;
    }
    try {
      const cooperation = (await getGroupByPath({ path })) as Cooperation;
      // Cache it for offline use
      if (cooperation?.id) {
        await db.cooperations.put({ ...cooperation, syncStatus: SyncStatus.SYNCED, syncRetries: 0 });
      }
      return cooperation;
    } catch (error) {
      console.error(`Failed to fetch cooperation with path ${path}:`, error);
      // Fallback to local cache on error
      return db.cooperations.filter((c) => c.path === path).first();
    }
  },

  async add(
    cooperation: Omit<Cooperation, "id" | "syncStatus">,
    organizationId?: string,
  ) {
    const newCooperation: Cooperation = {
      ...cooperation,
      id: uuidv4(),
      syncStatus: "new",
    };
    await db.cooperations.add(newCooperation);
    if (organizationId) {
      await cooperationSyncService.sync(organizationId);
    } else {
      console.warn("Organization ID not provided, cooperation sync may fail");
      await cooperationSyncService.sync("");
    }
    return newCooperation;
  },

  async update(
    id: string,
    updates: Partial<Omit<Cooperation, "id" | "syncStatus">>,
    organizationId?: string,
  ): Promise<Cooperation | undefined> {
    const cooperation = await db.cooperations.get(id);
    if (!cooperation) {
      console.warn(`Cooperation with ID ${id} not found`);
      return undefined;
    }

    const updatedCooperation = {
      ...cooperation,
      ...updates,
      syncStatus: "updated" as const,
    };

    await db.cooperations.put(updatedCooperation);

    if (organizationId) {
      await cooperationSyncService.sync(organizationId);
    } else {
      console.warn("Organization ID not provided, cooperation sync may fail");
      await cooperationSyncService.sync("");
    }

    return updatedCooperation;
  },

  async delete(id: string, organizationId?: string) {
    const cooperation = await db.cooperations.get(id);
    if (cooperation) {
      await db.cooperations.update(id, { syncStatus: "deleted" });
      if (organizationId) {
        await cooperationSyncService.sync(organizationId);
      } else {
        console.warn("Organization ID not provided, cooperation sync may fail");
        await cooperationSyncService.sync("");
      }
    }
  },
};
