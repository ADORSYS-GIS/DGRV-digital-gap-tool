import { db } from "@/services/db";
import { submitAssessment as submitAssessmentApi } from "@/services/submissions";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";

/**
 * Syncs any pending assessment submissions from the sync queue.
 * Called when the app comes back online.
 */
export const assessmentSubmissionSyncService = {
    async sync(): Promise<void> {
        // Get all pending assessment submission sync queue entries
        const pendingSubmissions = await db.sync_queue
            .where("entityType")
            .equals("AssessmentSubmission")
            .and((item) => item.action === "CREATE")
            .toArray();

        if (pendingSubmissions.length === 0) return;

        let syncedCount = 0;
        let failedCount = 0;

        for (const queueItem of pendingSubmissions) {
            try {
                const payload = queueItem.payload as { assessment_id: string };
                if (!payload?.assessment_id) {
                    await db.sync_queue.delete(queueItem.id!);
                    continue;
                }

                // First, check if there are pending dimension assessments for this assessment
                // and ensure they are synced before submitting the full assessment
                const pendingDimensionAssessments = await db.dimensionAssessments
                    .where("assessmentId")
                    .equals(payload.assessment_id)
                    .and((da) => da.syncStatus === "PENDING")
                    .toArray();

                if (pendingDimensionAssessments.length > 0) {
                    // Skip for now — will retry on next sync cycle after dimensions are flushed
                    console.log(
                        `Assessment ${payload.assessment_id} has ${pendingDimensionAssessments.length} pending dimension assessments. Deferring full submission.`,
                    );
                    continue;
                }

                // All dimensions are synced, submit the full assessment
                await submitAssessmentApi({
                    requestBody: { assessment_id: payload.assessment_id },
                });

                // Remove from sync queue on success
                await db.sync_queue.delete(queueItem.id!);
                syncedCount++;

                // Invalidate caches
                queryClient.invalidateQueries({ queryKey: ["assessments"] });
                queryClient.invalidateQueries({ queryKey: ["submissions"] });
                queryClient.invalidateQueries({ queryKey: ["reports"] });
            } catch (error) {
                console.error(`Failed to sync assessment submission:`, error);
                const retries = (queueItem.retries || 0) + 1;
                if (retries >= 3) {
                    // Give up after 3 attempts
                    await db.sync_queue.delete(queueItem.id!);
                    failedCount++;
                } else {
                    await db.sync_queue.update(queueItem.id!, { retries });
                }
            }
        }

        if (syncedCount > 0) {
            toast.success(
                `${syncedCount} assessment${syncedCount > 1 ? "s" : ""} synced successfully.`,
            );
        }
        if (failedCount > 0) {
            toast.error(
                `${failedCount} assessment${failedCount > 1 ? "s" : ""} failed to sync. Will retry later.`,
            );
        }
    },
};
