import {
    createDimensionAssessment,
    updateDimensionAssessment,
} from "@/openapi-client/services.gen";
import { db } from "@/services/db";
import { dimensionAssessmentRepository } from "../assessments/dimensionAssessmentRepository";
import { SyncQueueItem } from "@/types/sync";

export const dimensionAssessmentSyncService = {
    sync: async () => {
        const pendingOperations = await db.sync_queue
            .where("entityType")
            .equals("DimensionAssessment")
            .toArray();

        if (pendingOperations.length === 0) return;

        console.log(`Found ${pendingOperations.length} pending dimension assessments to sync.`);

        for (const op of pendingOperations) {
            try {
                await dimensionAssessmentSyncService.processOperation(op);
                await db.sync_queue.delete(op.id!);
            } catch (error) {
                console.error(`Failed to sync dimension assessment operation ${op.id}:`, error);
                // Mark as failed in the local DB so we can track it
                await dimensionAssessmentRepository.markAsFailed(
                    op.entityId,
                    (error as Error).message
                );
            }
        }
    },

    processOperation: async (op: SyncQueueItem) => {
        const payload = op.payload as any;

        switch (op.action) {
            case "CREATE": {
                const response = await createDimensionAssessment({
                    id: payload.assessment_id,
                    requestBody: {
                        dimension_id: payload.dimension_id,
                        current_state_id: payload.current_state_id,
                        desired_state_id: payload.desired_state_id,
                        gap_score: payload.gap_score,
                        organization_id: payload.organization_id,
                        cooperation_id: payload.cooperation_id,
                    },
                });

                if (response.data) {
                    // Sync successful, update local record with server data
                    const serverData = response.data as any;
                    await dimensionAssessmentRepository.markAsSynced(
                        op.entityId,
                        serverData
                    );
                }
                break;
            }
            case "UPDATE": {
                const response = await updateDimensionAssessment({
                    assessmentId: payload.assessment_id,
                    dimensionAssessmentId: op.entityId,
                    requestBody: {
                        dimension_id: payload.dimension_id,
                        current_state_id: payload.current_state_id,
                        desired_state_id: payload.desired_state_id,
                        gap_score: payload.gap_score,
                    },
                });

                if (response.data) {
                    const serverData = response.data as any;
                    await dimensionAssessmentRepository.markAsSynced(
                        op.entityId,
                        serverData
                    );
                }
                break;
            }
            case "DELETE": {
                // Handle deletion if needed - usually dimension assessments are just updated or replaced
                break;
            }
            default:
                console.warn(`Unknown sync action for DimensionAssessment: ${op.action}`);
        }
    },
};
