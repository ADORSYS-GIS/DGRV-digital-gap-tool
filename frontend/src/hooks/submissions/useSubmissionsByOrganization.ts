import { useQuery } from "@tanstack/react-query";
import { submissionRepository } from "@/services/assessments/submissionRepository";
import type { AssessmentSummary } from "@/types/assessment";

export interface UseSubmissionsByOrganizationOptions {
  enabled?: boolean;
  limit?: number;
  status?: string[];
  refetchOnMount?: boolean | "always";
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

/**
 * Hook to fetch and manage submissions for a specific organization
 * @param organizationId The ID of the organization to fetch submissions for
 * @param options Configuration options for the query
 * @returns Query result with submissions array and metadata
 */
export const useSubmissionsByOrganization = (
  organizationId: string,
  options: UseSubmissionsByOrganizationOptions = {},
) => {
  const queryKey = [
    "submissions",
    "organization",
    organizationId,
    options?.limit,
    options?.status,
  ];

  return useQuery<AssessmentSummary[]>({
    queryKey,
    queryFn: async () => {
      if (!organizationId) return [];
      
      const submissions = await submissionRepository.listByOrganization(organizationId);

      let filtered = [...submissions];

      if (options?.status?.length) {
        filtered = filtered.filter(
          (submission) =>
            submission.assessment.status &&
            options.status?.includes(submission.assessment.status),
        );
      }

      if (options?.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered;
    },
    enabled: options?.enabled !== false && !!organizationId,
    refetchOnMount: options?.refetchOnMount ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
  });
};
