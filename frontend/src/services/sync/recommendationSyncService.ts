import {
  createRecommendation,
  deleteRecommendation,
  updateRecommendation,
} from "@/openapi-client/services.gen";
import { db } from "@/services/db";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";
import { IRecommendation } from "@/types/recommendation";
import { SyncQueueItem } from "@/types/sync";

export const recommendationSyncService = {
  sync: async () => {
    const pendingOperations = await db.sync_queue
      .where("entityType")
      .equals("Recommendation")
      .toArray();

    for (const op of pendingOperations) {
      try {
        await recommendationSyncService.processOperation(op);
        await db.sync_queue.delete(op.id!);
      } catch (error) {
        console.error(
          `Failed to sync recommendation operation ${op.id}:`,
          error,
        );
        recommendationRepository.markAsFailed(
          op.entityId,
          (error as Error).message,
        );
      }
    }
  },

  processOperation: async (op: SyncQueueItem) => {
    const payload = op.payload as IRecommendation;

    switch (op.action) {
      case "CREATE": {
        const requestBody = {
          dimension_id: payload.dimension_id,
          priority: payload.priority ?? "MEDIUM",
          description: payload.description,
        };
        const response = await createRecommendation({ requestBody });
        const responseData: any = response.data as any;
        const serverId: string | undefined =
          responseData?.recommendation_id ?? responseData?.data?.recommendation_id;

        if (serverId) {
          await recommendationRepository.markAsSynced(op.entityId, serverId);
        }
        break;
      }
      case "UPDATE": {
        const requestBody = {
          priority: payload.priority ?? "MEDIUM",
          description: payload.description,
        };
        await updateRecommendation({
          id: op.entityId,
          requestBody,
        });
        await recommendationRepository.markAsSynced(op.entityId, op.entityId);
        break;
      }
      case "DELETE": {
        await deleteRecommendation({ id: op.entityId });
        await db.recommendations.delete(op.entityId);
        break;
      }
      default:
        console.warn(`Unknown sync action: ${op.action}`);
    }
  },
};
