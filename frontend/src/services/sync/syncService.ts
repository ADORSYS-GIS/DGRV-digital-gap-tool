import { db } from "@/services/db";
import { SyncQueueItem, SyncStatus } from "@/types/sync/index";
import {
  createDimension,
  updateDimension,
  deleteDimension,
} from "@/openapi-client/services.gen";
import { IDimension } from "@/types/dimension";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const syncService = {
  async addToSyncQueue(
    entityType: string,
    entityId: string,
    action: "CREATE" | "UPDATE" | "DELETE",
    payload: unknown
  ) {
    const item: SyncQueueItem = {
      entityType,
      entityId,
      action,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0,
    };
    await db.sync_queue.add(item);
    // Immediately attempt to process the queue after adding an item
    void syncService.processSyncQueue();
  },

  processSyncQueue: async () => {
    const items = await db.sync_queue.toArray();
    for (const item of items) {
      try {
        switch (item.entityType) {
          case "Dimension":
            await syncService.syncDimension(item);
            break;
        }
        await db.sync_queue.delete(item.id!);
      } catch (error: unknown) {
        console.error(`Sync failed for item ${item.id}:`, error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const updatedRetries = item.retries + 1;
        await db.sync_queue.update(item.id!, {
          retries: updatedRetries,
          lastError: errorMessage,
        });
        // Optionally, mark the local entity as FAILED if retries exceed a threshold
        if (updatedRetries >= 3) {
          if (item.entityType === "Dimension") {
            await dimensionRepository.markAsFailed(item.entityId, errorMessage);
          }
        }
      }
    }
  },

  async syncDimension(item: SyncQueueItem) {
    const dimensionData = item.payload as IDimension;
    switch (item.action) {
      case "CREATE": {
        console.log("Attempting to create dimension on server:", dimensionData);
        try {
          const response = await createDimension({
            requestBody: {
              name: dimensionData.name,
              description: dimensionData.description ?? null,
              category: dimensionData.category ?? null,
              is_active: dimensionData.is_active ?? null,
              weight: dimensionData.weight ?? null,
            },
          });
          if (response.data) {
            await dimensionRepository.markAsSynced(
              dimensionData.id,
              response.data.dimension_id,
            );
            console.log("Dimension created and synced successfully:", response.data);
          } else {
            throw new Error(
              response.error || "Failed to create dimension on server",
            );
          }
        } catch (error) {
          console.error("Error during createDimension API call:", error);
          throw error; // Re-throw to be caught by processSyncQueue's error handling
        }
        break;
      }
      case "UPDATE": {
        const response = await updateDimension({
          id: item.entityId,
          requestBody: {
            name: dimensionData.name,
            description: dimensionData.description ?? null,
            category: dimensionData.category ?? null,
            is_active: dimensionData.is_active ?? null,
            weight: dimensionData.weight ?? null,
          },
        });
        if (response.data) {
          await dimensionRepository.markAsSynced(item.entityId, response.data.dimension_id);
        } else {
          throw new Error(response.error || "Failed to update dimension on server");
        }
        break;
      }
      case "DELETE": {
        await deleteDimension({ id: item.entityId });
        await dimensionRepository.markAsSynced(item.entityId, item.entityId); // Mark as synced even if deleted
        break;
      }
    }
  },
};