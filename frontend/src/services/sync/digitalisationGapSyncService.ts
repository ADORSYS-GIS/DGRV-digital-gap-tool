import {
  adminCreateGap,
  deleteGap,
  updateGap,
} from "@/openapi-client/services.gen";
import { db } from "@/services/db";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { IDigitalisationGap } from "@/types/digitalisationGap";
import { SyncQueueItem } from "@/types/sync";

export const digitalisationGapSyncService = {
  sync: async () => {
    const pendingOperations = await db.sync_queue
      .where("entityType")
      .equals("DigitalisationGap")
      .toArray();

    for (const op of pendingOperations) {
      try {
        await digitalisationGapSyncService.processOperation(op);
        await db.sync_queue.delete(op.id!);
      } catch (error) {
        console.error(
          `Failed to sync digitalisation gap operation ${op.id}:`,
          error,
        );
        digitalisationGapRepository.markAsFailed(
          op.entityId,
          (error as Error).message,
        );
      }
    }
  },

  processOperation: async (op: SyncQueueItem) => {
    const payload = op.payload as IDigitalisationGap;

    switch (op.action) {
      case "CREATE": {
        const requestBody = {
          dimension_id: payload.dimensionId,
          gap_description: payload.description,
          gap_severity: payload.gap_severity,
        };
        const response = await adminCreateGap({ requestBody });
        if (response.data) {
          await digitalisationGapRepository.markAsSynced(
            op.entityId,
            response.data.gap_id,
          );
        }
        break;
      }
      case "UPDATE": {
        const requestBody = {
          gap_description: payload.description,
          gap_severity: payload.gap_severity,
        };
        await updateGap({
          id: op.entityId,
          requestBody,
        });
        await digitalisationGapRepository.markAsSynced(op.entityId, op.entityId);
        break;
      }
      case "DELETE": {
        await deleteGap({ id: op.entityId });
        await db.digitalisationGaps.delete(op.entityId);
        break;
      }
      default:
        console.warn(`Unknown sync action: ${op.action}`);
    }
  },
};