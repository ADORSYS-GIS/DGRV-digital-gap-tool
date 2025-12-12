import { listAssessmentsByCooperation } from "@/openapi-client/services.gen";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { useQuery } from "@tanstack/react-query";
import { Assessment } from "@/types/assessment";

export interface UseAssessmentsByCooperationOptions {
  enabled?: boolean;
  status?: string[];
  refetchOnMount?: boolean | "always";
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

export const useAssessmentsByCooperation = (
  cooperationId: string,
  options: UseAssessmentsByCooperationOptions = {},
) => {
  const queryKey = [
    "assessments",
    "cooperation",
    cooperationId,
    options?.status,
  ];

  return useQuery<Assessment[]>({
    queryKey,
    queryFn: async () => {
      const fetcher = async () => {
        const response = await listAssessmentsByCooperation({ cooperationId });
        return {
          ...response,
          data: response.data ?? { assessments: [] },
        };
      };

      const assessments = await assessmentRepository.syncAssessments(
        fetcher,
        "cooperation_id",
        cooperationId,
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
    enabled: options?.enabled !== false && !!cooperationId,
    refetchOnMount: options?.refetchOnMount ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
  });
};
