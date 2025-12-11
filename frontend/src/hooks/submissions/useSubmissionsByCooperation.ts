import {
  AssessmentResponse,
  AssessmentsResponse,
  AssessmentSummaryResponse,
  listSubmissionsByCooperation,
} from "@/openapi-client";
import { useQuery } from "@tanstack/react-query";

export const useSubmissionsByCooperation = (
  cooperationId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery<AssessmentSummaryResponse[]>({
    queryKey: ["submissions", "cooperation", cooperationId],
    queryFn: async () => {
      if (!cooperationId) return [];
      const response = (await listSubmissionsByCooperation({
        cooperationId,
      })) as unknown as { data: AssessmentsResponse };

      const submissionsData = response.data?.assessments || [];
      const submissions = submissionsData.map(
        (assessment: AssessmentResponse) =>
          ({
            assessment,
            dimension_assessments: [],
            gaps_count: 0,
            recommendations_count: 0,
            overall_score: null,
          }) as AssessmentSummaryResponse,
      );

      return submissions;
    },
    enabled: !!cooperationId && options?.enabled !== false,
  });
};
