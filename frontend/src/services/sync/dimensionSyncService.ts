import {
  createDimension,
  deleteDimension,
  updateDimension,
} from "@/openapi-client/services.gen";
import { db } from "@/services/db";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { IDimension } from "@/types/dimension";
import { SyncQueueItem } from "@/types/sync";

export const dimensionSyncService = {
  sync: async () => {
    const pendingOperations = await db.sync_queue
      .where("entityType")
      .equals("Dimension")
      .toArray();

    for (const op of pendingOperations) {
      try {
        await dimensionSyncService.processOperation(op);
        await db.sync_queue.delete(op.id!);
      } catch (error) {
        console.error(`Failed to sync dimension operation ${op.id}:`, error);
        dimensionRepository.markAsFailed(op.entityId, (error as Error).message);
      }
    }
  },

  processOperation: async (op: SyncQueueItem) => {
    const payload = op.payload as IDimension;

    switch (op.action) {
      case "CREATE": {
        const requestBody = {
          name: payload.name,
          description: payload.description ?? null,
          category: payload.category ?? null,
          weight: payload.weight ?? null,
        };
        const response = await createDimension({ requestBody });
        if (response.data) {
          await dimensionRepository.markAsSynced(
            op.entityId,
            response.data.dimension_id,
          );
        }
        break;
      }
      case "UPDATE": {
        const requestBody = {
          name: payload.name,
          description: payload.description ?? null,
          category: payload.category ?? null,
          weight: payload.weight ?? null,
        };
        await updateDimension({
          id: op.entityId,
          requestBody,
        });
        await dimensionRepository.markAsSynced(op.entityId, op.entityId);
        break;
      }
      case "DELETE": {
        await deleteDimension({ id: op.entityId });
        await db.dimensions.delete(op.entityId);
        break;
      }
      default:
        console.warn(`Unknown sync action: ${op.action}`);
    }
  },
};
