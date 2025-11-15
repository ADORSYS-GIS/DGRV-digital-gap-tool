import { useQuery } from "@tanstack/react-query";
import { submissionRepository } from "@/services/assessments/submissionRepository";

export const useSubmissionSummary = (assessmentId: string) => {
  return useQuery({
    queryKey: ["submissionSummary", assessmentId],
    queryFn: () => submissionRepository.getSubmissionSummary(assessmentId),
    enabled: !!assessmentId,
  });
};
