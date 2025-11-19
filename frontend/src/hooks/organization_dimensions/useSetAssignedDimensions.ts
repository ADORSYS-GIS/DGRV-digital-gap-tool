import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationDimensionRepository } from "@/services/organizations/organizationDimensionRepository";
import { organizationDimensionSyncService } from "@/services/sync/organizationDimensionSyncService";

export const useSetAssignedDimensions = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: (dimensionIds: string[]) =>
      organizationDimensionRepository.setAssignedDimensions(
        organizationId,
        dimensionIds,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizationDimensions", organizationId],
      });
      // Trigger background sync
      organizationDimensionSyncService.syncPendingAssignments();
    },
  });
};