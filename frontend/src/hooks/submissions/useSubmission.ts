import { useQuery } from "@tanstack/react-query";
import { getAssessmentSummary } from "@/services/assessments/submissionRepository";

export const useSubmission = (submissionId: string) => {
  return useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () => getAssessmentSummary(submissionId),
    enabled: !!submissionId,
  });
};