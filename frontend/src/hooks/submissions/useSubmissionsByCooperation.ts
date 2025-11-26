import { useQuery } from "@tanstack/react-query";
import { submissionRepository } from "@/services/assessments/submissionRepository";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { AssessmentSummary } from "@/types/assessment";

export interface UseSubmissionsByCooperationOptions {
  /**
   * Whether the query is enabled
   */
  enabled?: boolean;
  /**
   * Maximum number of submissions to return
   */
  limit?: number;
  /**
   * Filter submissions by status
   */
  status?: string[];
  /**
   * Whether to refetch when the component mounts
   */
  refetchOnMount?: boolean | "always";
  /**
   * Whether to refetch when the window regains focus
   */
  refetchOnWindowFocus?: boolean;
  /**
   * How long to keep the data fresh before refetching (in ms)
   */
  staleTime?: number;
}

/**
 * Hook to fetch and manage submissions for a specific cooperation
 * @param cooperationId The ID of the cooperation to fetch submissions for
 * @param options Configuration options for the query
 * @returns Query result with submissions array and metadata
 */
export const useSubmissionsByCooperation = (
  cooperationId: string,
  options: UseSubmissionsByCooperationOptions = {},
) => {
  const queryKey = [
    "submissions",
    "cooperation",
    cooperationId,
    options?.limit,
    options?.status,
  ];

  return useQuery<AssessmentSummary[]>({
    queryKey,
    queryFn: async () => {
      console.log("Fetching submissions for cooperation:", cooperationId);

      if (!cooperationId) {
        console.warn(
          "No cooperation ID provided to useSubmissionsByCooperation",
        );
        return [];
      }

      try {
        const submissions =
          await submissionRepository.listByCooperation(cooperationId);
        console.log("Fetched cooperation submissions:", submissions);

        // Apply client-side filtering if needed
        let filtered = [...submissions];

        // Filter by status if specified
        if (options?.status?.length) {
          filtered = filtered.filter(
            (submission) =>
              submission.assessment.status &&
              options.status?.includes(submission.assessment.status),
          );
        }

        // Apply limit if specified
        if (options?.limit) {
          filtered = filtered.slice(0, options.limit);
        }

        console.log(
          `Fetched ${filtered.length} submissions for cooperation ${cooperationId}`,
        );
        return filtered;
      } catch (error) {
        console.error("Failed to fetch cooperation submissions:", error);
        // Return empty array instead of throwing to prevent UI errors
        return [];
      }
    },
    // Only enable the query if we have a cooperationId
    enabled: options?.enabled !== false,
    // Default to refetching on mount
    refetchOnMount: options?.refetchOnMount ?? true,
    // Don't refetch on window focus by default
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    // Cache submissions for 5 minutes by default
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
  });
};
