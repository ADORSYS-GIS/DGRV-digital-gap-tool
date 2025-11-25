import { useQuery } from "@tanstack/react-query";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { listAssessmentsByOrganization } from "@/openapi-client/services.gen";
import type { AssessmentResponse } from "@/openapi-client/types.gen";
import { Assessment } from "@/types/assessment";

export const useAssessmentsByOrganization = (
  organizationId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["assessments", "organization", organizationId],
    queryFn: async () => {
      const fetcher = async () => {
        const response = await listAssessmentsByOrganization({
          organizationId,
        });
        return {
          ...response,
          data: response.data ?? { assessments: [] },
        };
      };
      return assessmentRepository.syncAssessments(
        fetcher,
        "organization_id",
        organizationId,
      );
    },
    enabled: options?.enabled !== false,
  });
};
