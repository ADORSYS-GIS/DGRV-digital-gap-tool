import { useQuery } from "@tanstack/react-query";
import { submissionRepository } from "@/services/submissions/submissionRepository";

export function useSubmissions(assessmentId?: string) {
  return useQuery({
    queryKey: ["submissions", assessmentId],
    queryFn: () =>
      assessmentId
        ? submissionRepository.getSubmissionsByAssessmentId(assessmentId)
        : submissionRepository.getAllSubmissions(),
  });
}