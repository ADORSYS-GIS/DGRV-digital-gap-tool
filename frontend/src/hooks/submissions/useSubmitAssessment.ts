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
        // If it's a network error (status 0 or similar), or if we are actually offline
        // but navigator.onLine was true, fallback to local queue
        const isNetworkError =
          !navigator.onLine ||
          (error instanceof Object && "status" in error && error.status === 0) ||
          error instanceof TypeError; // fetch throws TypeError on network failure

        if (isNetworkError) {
          console.warn("Network error during assessment submission, falling back to local queue.");
          await db.sync_queue.add({
            entityType: "AssessmentSubmission",
            entityId: assessmentId,
            action: "CREATE",
            payload: { assessment_id: assessmentId },
            timestamp: new Date().toISOString(),
            retries: 0,
          });

          toast.info(
            "Connection lost. Your assessment has been saved locally and will be submitted automatically when you are back online.",
            { duration: 7000 },
          );
          return null;
        }

        // For other API errors (4xx, 5xx), re-throw so the UI can show the error
        throw error;
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
