import {
  getOrganizationDimensions,
  updateOrganizationDimensions,
} from "@/openapi-client/services.gen";
import { organizationDimensionRepository } from "@/services/organizations/organizationDimensionRepository";
import { SyncStatus } from "@/types/sync";

export const organizationDimensionSyncService = {
  async syncPendingAssignments(): Promise<void> {
    const pendingAssignments =
      await organizationDimensionRepository.getDirtyAssignments();

    const dirtyOrgIds = [
      ...new Set(pendingAssignments.map((a) => a.organizationId)),
    ];

    for (const orgId of dirtyOrgIds) {
      try {
        const currentLocalDimensions =
          await organizationDimensionRepository.getDimensionsByOrganizationId(
            orgId,
          );

        await updateOrganizationDimensions({
          orgId,
          requestBody: {
            dimension_ids: currentLocalDimensions,
          },
        });

        const assignmentsForOrg = pendingAssignments.filter(
          (a) => a.organizationId === orgId,
        );
        for (const assignment of assignmentsForOrg) {
          await organizationDimensionRepository.updateAssignmentSyncStatus(
            assignment.id,
            SyncStatus.SYNCED,
          );
        }
      } catch (error) {
        console.error(
          `Failed to sync organization dimensions for org ${orgId}`,
          error,
        );
      }
    }
  },
  async syncOrganizationDimensions(organizationId: string): Promise<void> {
    try {
      const remoteDimensions = await getOrganizationDimensions({
        orgId: organizationId,
      });
      await organizationDimensionRepository.setAssignedDimensions(
        organizationId,
        remoteDimensions,
      );
    } catch (error) {
      console.error(
        `Failed to sync organization dimensions for org ${organizationId}`,
        error,
      );
    }
  },
};
