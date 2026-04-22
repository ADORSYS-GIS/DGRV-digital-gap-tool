import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAssessment as submitAssessmentApi } from "@/services/submissions";
import { toast } from "sonner";
import { ApiError } from "@/openapi-client";
import { db } from "@/services/db";

/**
 * Mutation hook to submit a completed assessment.
 * - When online: submits to the API immediately.
 * - When offline: queues the submission locally and shows a toast.
 *   The submission will be retried automatically when the app comes back online
 *   via the syncManager's `handleOnline` → `assessmentSubmissionSyncService.sync()` flow.
 */
export function useSubmitAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: async (assessmentId: string) => {
      if (!navigator.onLine) {
        // Queue for later sync
        await db.sync_queue.add({
          entityType: "AssessmentSubmission",
          entityId: assessmentId,
          action: "CREATE",
          payload: { assessment_id: assessmentId },
          timestamp: new Date().toISOString(),
          retries: 0,
        });

        toast.info(
          "You are offline. Your assessment is saved and will be submitted automatically when you reconnect.",
          { duration: 7000 },
        );
        // Return a mock response so the UI can proceed to the next screen
        return null;
      }

      // Online path: try submit directly
      try {
        return await submitAssessmentApi({
          requestBody: { assessment_id: assessmentId },
        });
      } catch (error) {
        // Fallback for ANY error that is not a successful server response
        // (Status 0, network timeouts, fetch failures, etc.)
        console.warn("Assessment submission failed, potentially offline. Falling back to local queueing:", error);

        await db.sync_queue.add({
          entityType: "AssessmentSubmission",
          entityId: assessmentId,
          action: "CREATE",
          payload: { assessment_id: assessmentId },
          timestamp: new Date().toISOString(),
          retries: 0,
        });

        toast.info(
          "Saved locally. Your assessment will be synchronized automatically when a stable connection is restored.",
          { duration: 7000 },
        );
        return null;
      }
    },
    onSuccess: (data) => {
      if (data !== null) {
        toast.success(
          "Assessment submitted successfully. Report generation has started.",
        );
      }
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error: ApiError) => {
      const errorBody = error.body as { message?: string };
      const errorMessage = errorBody?.message || "Failed to submit assessment";
      toast.error(errorMessage);
    },
  });
}
