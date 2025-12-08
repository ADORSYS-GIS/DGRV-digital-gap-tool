import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAssessment } from "@/services/submissions";
import { toast } from "sonner";
import { ApiError } from "@/openapi-client";

export function useSubmitAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assessmentId: string) =>
      submitAssessment({ requestBody: { assessment_id: assessmentId } }),
    onSuccess: () => {
      toast.success(
        "Assessment submitted successfully. Report generation has started.",
      );
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
