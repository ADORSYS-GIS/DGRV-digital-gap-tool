import { useQuery } from "@tanstack/react-query";
import { submissionRepository } from "@/services/assessments/submissionRepository";
import type { AssessmentSummary } from "@/types/assessment";

export const useSubmissionsByCooperation = (
  cooperationId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery<AssessmentSummary[]>({
    queryKey: ["submissions", "cooperation", cooperationId],
    queryFn: async () => {
      if (!cooperationId) return [];
      return await submissionRepository.listByCooperation(cooperationId);
    },
    enabled: !!cooperationId && options?.enabled !== false,
  });
};
