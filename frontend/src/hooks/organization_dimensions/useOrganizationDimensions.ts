import { useQuery } from "@tanstack/react-query";
import { organizationDimensionRepository } from "@/services/organizations/organizationDimensionRepository";
import { organizationDimensionSyncService } from "@/services/sync/organizationDimensionSyncService";

export const useOrganizationDimensions = (organizationId: string) => {
  return useQuery({
    queryKey: ["organizationDimensions", organizationId],
    queryFn: async () => {
      await organizationDimensionSyncService.syncOrganizationDimensions(
        organizationId,
      );
      return organizationDimensionRepository.getDimensionsByOrganizationId(
        organizationId,
      );
    },
    enabled: !!organizationId,
  });
};
