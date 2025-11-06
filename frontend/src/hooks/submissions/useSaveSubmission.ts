import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submissionRepository } from "@/services/submissions/submissionRepository";
import { Submission } from "@/types/submission";

export function useSaveSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submission: Omit<Submission, "id">) =>
      submissionRepository.saveSubmission(submission),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["submissions", data.assessmentId],
      });
      queryClient.setQueryData(
        ["submission", data.assessmentId, data.dimensionId],
        data,
      );
    },
  });
}