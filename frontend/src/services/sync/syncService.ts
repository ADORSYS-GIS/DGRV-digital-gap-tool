import {
  createDimension,
  deleteDimension,
  updateDimension,
  createCurrentState,
  updateCurrentState,
  deleteCurrentState,
  createDesiredState,
  updateDesiredState,
  deleteDesiredState,
} from "@/openapi-client/services.gen";
import { db } from "@/services/db";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import { IDigitalisationLevel } from "@/types/digitalisationLevel";
import { IDimension } from "@/types/dimension";
import { SyncQueueItem } from "@/types/sync/index";

export const syncService = {
  async addToSyncQueue(
    entityType: string,
    entityId: string,
    action: "CREATE" | "UPDATE" | "DELETE",
    payload: unknown,
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

  async removeFromSyncQueue(entityType: string, entityId: string) {
    const item = await db.sync_queue.where({ entityType, entityId }).first();
    if (item) {
      await db.sync_queue.delete(item.id!);
    }
  },

  processSyncQueue: async () => {
    const items = await db.sync_queue.toArray();
    for (const item of items) {
      try {
        switch (item.entityType) {
          case "Dimension":
            await syncService.syncDimension(item);
            break;
          case "CurrentState":
            await syncService.syncCurrentState(item);
            break;
          case "DesiredState":
            await syncService.syncDesiredState(item);
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
          } else if (
            item.entityType === "CurrentState" ||
            item.entityType === "DesiredState"
          ) {
            await digitalisationLevelRepository.markAsFailed(
              item.entityId,
              errorMessage,
            );
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
            console.log(
              "Dimension created and synced successfully:",
              response.data,
            );
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
          await dimensionRepository.markAsSynced(
            item.entityId,
            response.data.dimension_id,
          );
        } else {
          throw new Error(
            response.error || "Failed to update dimension on server",
          );
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

  async syncCurrentState(item: SyncQueueItem) {
    const currentStateData = item.payload as IDigitalisationLevel;
    const dimensionId = currentStateData.dimensionId; // Assuming dimensionId is part of payload

    switch (item.action) {
      case "CREATE": {
        console.log(
          "Attempting to create current state on server:",
          currentStateData,
        );
        try {
          const response = await createCurrentState({
            id: dimensionId,
            requestBody: {
              dimension_id: dimensionId,
              score: currentStateData.state,
              description: currentStateData.description ?? null,
              level: currentStateData.level ?? null,
            },
          });
          if (response.data) {
            await digitalisationLevelRepository.markAsSynced(
              currentStateData.id,
              response.data.current_state_id,
            );
            console.log(
              "Current state created and synced successfully:",
              response.data,
            );
          } else {
            throw new Error(
              response.error || "Failed to create current state on server",
            );
          }
        } catch (error) {
          console.error("Error during createCurrentState API call:", error);
          throw error;
        }
        break;
      }
      case "UPDATE": {
        const response = await updateCurrentState({
          dimensionId: dimensionId,
          currentStateId: item.entityId,
          requestBody: {
            score: currentStateData.state,
            description: currentStateData.description ?? null,
            level: currentStateData.level ?? null,
          },
        });
        if (response.data) {
          await digitalisationLevelRepository.markAsSynced(
            item.entityId,
            response.data.current_state_id,
          );
        } else {
          throw new Error(
            response.error || "Failed to update current state on server",
          );
        }
        break;
      }
      case "DELETE": {
        await deleteCurrentState({
          dimensionId: dimensionId,
          currentStateId: item.entityId,
        });
        await digitalisationLevelRepository.markAsSynced(
          item.entityId,
          item.entityId,
        ); // Mark as synced even if deleted
        break;
      }
    }
  },

  async syncDesiredState(item: SyncQueueItem) {
    const desiredStateData = item.payload as IDigitalisationLevel;
    const dimensionId = desiredStateData.dimensionId; // Assuming dimensionId is part of payload

    switch (item.action) {
      case "CREATE": {
        console.log(
          "Attempting to create desired state on server:",
          desiredStateData,
        );
        try {
          const response = await createDesiredState({
            id: dimensionId,
            requestBody: {
              dimension_id: dimensionId,
              score: desiredStateData.state,
              description: desiredStateData.description ?? null,
              level: desiredStateData.level ?? null,
            },
          });
          if (response.data) {
            await digitalisationLevelRepository.markAsSynced(
              desiredStateData.id,
              response.data.desired_state_id,
            );
            console.log(
              "Desired state created and synced successfully:",
              response.data,
            );
          } else {
            throw new Error(
              response.error || "Failed to create desired state on server",
            );
          }
        } catch (error) {
          console.error("Error during createDesiredState API call:", error);
          throw error;
        }
        break;
      }
      case "UPDATE": {
        const response = await updateDesiredState({
          dimensionId: dimensionId,
          desiredStateId: item.entityId,
          requestBody: {
            score: desiredStateData.state,
            description: desiredStateData.description ?? null,
            level: desiredStateData.level ?? null,
          },
        });
        if (response.data) {
          await digitalisationLevelRepository.markAsSynced(
            item.entityId,
            response.data.desired_state_id,
          );
        } else {
          throw new Error(
            response.error || "Failed to update desired state on server",
          );
        }
        break;
      }
      case "DELETE": {
        await deleteDesiredState({
          dimensionId: dimensionId,
          desiredStateId: item.entityId,
        });
        await digitalisationLevelRepository.markAsSynced(
          item.entityId,
          item.entityId,
        ); // Mark as synced even if deleted
        break;
      }
    }
  },
};
