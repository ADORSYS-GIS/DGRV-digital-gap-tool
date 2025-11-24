import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { submissionRepository } from "@/services/assessments/submissionRepository";
import { AssessmentSummary } from "@/types/assessment";

export const useSubmissionSummaryByCooperation = (
  assessmentId: string,
  cooperationId: string,
  options: Omit<
    UseQueryOptions<AssessmentSummary | undefined, Error>,
    "queryKey" | "queryFn"
  > = {},
) => {
  console.log(
    `[useSubmissionSummaryByCooperation] Fetching submission ${assessmentId} for cooperation ${cooperationId}`,
  );

  return useQuery<AssessmentSummary | undefined, Error>({
    queryKey: ["submissionSummary", "cooperation", cooperationId, assessmentId],
    queryFn: async () => {
      if (!cooperationId || !assessmentId) {
        console.log(
          "[useSubmissionSummaryByCooperation] Missing cooperationId or assessmentId",
        );
        return undefined;
      }

      console.log(
        `[useSubmissionSummaryByCooperation] Executing query for assessment ${assessmentId} in cooperation ${cooperationId}`,
      );
      try {
        const result =
          await submissionRepository.getSubmissionSummaryByCooperation(
            assessmentId,
            cooperationId,
          );
        console.log(
          `[useSubmissionSummaryByCooperation] Successfully fetched submission ${assessmentId} for cooperation ${cooperationId}`,
          result,
        );
        return result || undefined;
      } catch (error) {
        console.error(
          `[useSubmissionSummaryByCooperation] Error fetching submission ${assessmentId} for cooperation ${cooperationId}:`,
          error,
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to fetch submission");
      }
    },
    enabled: options?.enabled !== false && !!cooperationId && !!assessmentId,
    ...options,
  });
};
