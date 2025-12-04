import { useQuery } from "@tanstack/react-query";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { listAssessments } from "@/openapi-client/services.gen";
import type { AssessmentResponse } from "@/openapi-client/types.gen";
import { Assessment } from "@/types/assessment";

export const useAssessmentsByCooperation = (
  cooperationId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["assessments", "cooperation", cooperationId],
    queryFn: async () => {
      if (!cooperationId) {
        return Promise.resolve([]);
      }
      const fetcher = async () => {
        const response = await listAssessments({}); // Fetch all assessments
        const items = response.data?.items ?? []; // Ensure items is always an array
        const filteredAssessments = items.filter(
          (assessment) =>
            (assessment as AssessmentResponse & { cooperation_id?: string })
              .cooperation_id === cooperationId,
        );
        return {
          ...response,
          data: { assessments: filteredAssessments },
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
