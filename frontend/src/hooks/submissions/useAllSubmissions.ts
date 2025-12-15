import { useQuery } from "@tanstack/react-query";
import { useOrganizations } from "../organizations/useOrganizations";
import { listSubmissionsByOrganization } from "@/openapi-client";
import type {
  AssessmentResponse,
  AssessmentSummaryResponse,
  AssessmentsResponse,
} from "@/openapi-client";

export interface UseAllSubmissionsOptions {
  enabled?: boolean;
}

export const useAllSubmissions = (options: UseAllSubmissionsOptions = {}) => {
  const { data: organizations, isLoading: isLoadingOrgs } = useOrganizations();

  return useQuery<AssessmentSummaryResponse[]>({
    queryKey: ["submissions", "all", organizations?.map((o) => o.id)],
    queryFn: async () => {
      if (!organizations) return [];

      const allSubmissionsPromises = organizations.map((org) =>
        listSubmissionsByOrganization({ organizationId: org.id }),
      );

      const submissionResponses = await Promise.all(allSubmissionsPromises);

      const allSubmissions = submissionResponses
        .flatMap(
          (response) =>
            (response.data as unknown as AssessmentsResponse)?.assessments ||
            [],
        )
        .map(
          (assessment: AssessmentResponse): AssessmentSummaryResponse => ({
            assessment,
            dimension_assessments: [],
            gaps_count: 0,
            recommendations_count: 0,
            overall_score: null,
          }),
        );

      return allSubmissions.sort(
        (a, b) =>
          new Date(b.assessment.created_at || 0).getTime() -
          new Date(a.assessment.created_at || 0).getTime(),
      );
    },
    enabled: !!(options.enabled && !isLoadingOrgs && organizations),
  });
};
