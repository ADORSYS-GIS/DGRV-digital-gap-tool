import { listAssessmentsByCooperation } from "@/openapi-client/services.gen";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { useQuery } from "@tanstack/react-query";

export const useAssessmentsByCooperation = (
  cooperationId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["assessments", "cooperation", cooperationId],
    queryFn: async () => {
      const fetcher = async () => {
        const response = await listAssessmentsByCooperation({ cooperationId });
        return {
          ...response,
          data: response.data ?? { assessments: [] },
        };
      };
      return assessmentRepository.syncAssessments(
        fetcher,
        "cooperation_id",
        cooperationId,
      );
    },
    enabled: options?.enabled !== false,
  });
};
