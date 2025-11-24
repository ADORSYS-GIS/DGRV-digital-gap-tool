import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { submissionRepository } from "@/services/assessments/submissionRepository";
import { AssessmentSummary } from "@/types/assessment";

export const useSubmissionSummaryByOrganization = (
  assessmentId: string,
  organizationId: string,
  options: Omit<
    UseQueryOptions<AssessmentSummary | undefined, Error>,
    "queryKey" | "queryFn"
  > = {},
) => {
  console.log(
    `[useSubmissionSummaryByOrganization] Fetching submission ${assessmentId} for organization ${organizationId}`,
  );

  return useQuery<AssessmentSummary | undefined, Error>({
    queryKey: [
      "submissionSummary",
      "organization",
      assessmentId,
      organizationId,
    ],
    queryFn: async () => {
      if (!organizationId || !assessmentId) {
        console.log(
          "[useSubmissionSummaryByOrganization] Missing organizationId or assessmentId",
        );
        return undefined;
      }

      console.log(
        `[useSubmissionSummaryByOrganization] Executing query for assessment ${assessmentId} in organization ${organizationId}`,
      );
      try {
        const result =
          await submissionRepository.getSubmissionSummaryByOrganization(
            assessmentId,
            organizationId,
          );
        console.log(
          `[useSubmissionSummaryByOrganization] Successfully fetched submission ${assessmentId} for organization ${organizationId}`,
          result,
        );
        return result || undefined;
      } catch (error) {
        console.error(
          `[useSubmissionSummaryByOrganization] Error fetching submission ${assessmentId} for organization ${organizationId}:`,
          error,
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to fetch submission");
      }
    },
    enabled: options?.enabled !== false && !!organizationId && !!assessmentId,
    ...options,
  });
};
