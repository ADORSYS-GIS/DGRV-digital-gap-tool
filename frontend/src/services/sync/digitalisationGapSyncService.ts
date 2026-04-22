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
      const payload = op.payload as IDigitalisationGap;
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
          payload.lang || "en",
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
          dimension_key: (payload as any).dimension_key ?? payload.dimensionId,
          dimension_id: payload.dimensionId ?? undefined,
          gap_description: payload.description,
          gap_severity: payload.gap_severity,
          language: (payload as any).language ?? "en",
        };
        const response = await adminCreateGap({ requestBody });
        const responseData: any = response.data as any;
        const serverId: string | undefined =
          responseData?.gap_id ?? responseData?.data?.gap_id;

        if (serverId) {
          await digitalisationGapRepository.markAsSynced(op.entityId, serverId, payload.lang || "en");
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
        await digitalisationGapRepository.markAsSynced(
          op.entityId,
          op.entityId,
          payload.lang || "en"
        );
        break;
      }
      case "DELETE": {
        await deleteGap({ id: op.entityId });
        await db.digitalisationGaps.where("id").equals(op.entityId).delete();
        break;
      }
      default:
        console.warn(`Unknown sync action: ${op.action}`);
    }
  },
};
