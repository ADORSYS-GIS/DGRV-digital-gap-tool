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
      if (!organizationId) return [];

      try {
        if (navigator.onLine) {
          const response = await listAssessmentsByOrganization({
            organizationId,
          });

          if (response.data?.assessments) {
            const syncedAssessments = response.data.assessments.map(
              (assessment: AssessmentResponse) =>
                ({
                  id: assessment.assessment_id,
                  name: assessment.document_title,
                  organization_id: assessment.organization_id,
                  cooperation_id: assessment.cooperation_id,
                  status: assessment.status,
                  started_at: assessment.started_at || null,
                  completed_at: assessment.completed_at || null,
                  created_at: assessment.created_at,
                  updated_at: assessment.updated_at || new Date().toISOString(),
                  dimensionIds: (assessment.dimensions_id as string[]) ?? [],
                  syncStatus: "synced" as const,
                  lastError: "",
                }) as Assessment,
            );

            // Clear existing assessments for this organization before adding new ones
            await assessmentRepository.deleteByOrganizationId(organizationId);

            // Store in IndexedDB
            await assessmentRepository.bulkAdd(syncedAssessments);
            return syncedAssessments;
          }
        }

        // Fallback to local data if offline or API call fails
        return assessmentRepository.getAll();
      } catch (error) {
        console.error("Error fetching assessments by organization:", error);
        return [];
      }
    },
    enabled: options?.enabled !== false,
  });
};
