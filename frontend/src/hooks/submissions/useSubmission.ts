import { useQuery } from "@tanstack/react-query";
import { submissionRepository } from "@/services/submissions/submissionRepository";

export function useSubmission(assessmentId: string, dimensionId: string) {
  return useQuery({
    queryKey: ["submission", assessmentId, dimensionId],
    queryFn: () => submissionRepository.getSubmission(assessmentId, dimensionId),
  });
}