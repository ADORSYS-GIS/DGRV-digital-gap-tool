import { db } from "@/services/db";
import { authService } from "../shared/authService";
import { OfflineEntity } from "@/types/sync";
import { Dexie } from "dexie";
import { syncManager } from "./syncManager";

export const MAX_RETRIES = 3;

export const syncService = {
  processSyncQueue() {
    const organizationId = authService.getOrganizationId();
    syncManager.syncAll(organizationId);
  },

  async addToSyncQueue(
    entityType: string,
    entityId: string,
    action: "CREATE" | "UPDATE" | "DELETE",
    payload: unknown,
  ) {
    await db.sync_queue.add({
      entityType,
      entityId,
      action,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0,
    });
    this.processSyncQueue();
  },

  async trySync<T extends OfflineEntity>(
    table: Dexie.Table<T, string>,
    item: T,
    syncFn: () => Promise<unknown>,
  ) {
    try {
      await syncFn();
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
      const retries = (item.syncRetries || 0) + 1;
      if (retries > MAX_RETRIES) {
        await table.delete(item.id);
      } else {
        await table.update(item.id, (obj) => {
          obj.syncRetries = retries;
        });
      }
    }
  },
};
