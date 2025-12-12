import { useQuery } from "@tanstack/react-query";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { listAssessmentsByOrganization } from "@/openapi-client/services.gen";
import type { AssessmentResponse } from "@/openapi-client/types.gen";
import { Assessment } from "@/types/assessment";

export interface UseAssessmentsByOrganizationOptions {
  enabled?: boolean;
  status?: string[];
  refetchOnMount?: boolean | "always";
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

export const useAssessmentsByOrganization = (
  organizationId: string,
  options: UseAssessmentsByOrganizationOptions = {},
) => {
  const queryKey = [
    "assessments", 
    "organization", 
    organizationId,
    options?.status,
  ];

  return useQuery<Assessment[]>({
    queryKey,
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
      
      const assessments = await assessmentRepository.syncAssessments(
        fetcher,
        "organization_id",
        organizationId,
      );

      let filtered = [...assessments];
      
      if (options?.status?.length) {
        const statuses = options.status.map(s => s.toLowerCase());
        filtered = filtered.filter(
          (assessment) => 
            assessment.status && 
            statuses.includes(assessment.status.toLowerCase())
        );
      }
      
      return filtered;
    },
    enabled: options?.enabled !== false && !!organizationId,
    refetchOnMount: options?.refetchOnMount ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
  });
};
