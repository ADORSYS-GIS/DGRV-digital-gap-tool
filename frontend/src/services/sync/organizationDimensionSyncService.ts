import {
  getOrganizationDimensions,
  updateOrganizationDimensions,
} from "@/openapi-client/services.gen";
import { organizationDimensionRepository } from "@/services/organizations/organizationDimensionRepository";
import { SyncStatus } from "@/types/sync";
import { db } from "../db";
import { syncService } from "./syncService";

export const organizationDimensionSyncService = {
  async syncPendingAssignments(): Promise<void> {
    const pendingAssignments =
      await organizationDimensionRepository.getDirtyAssignments();

    const dirtyOrgIds = [
      ...new Set(pendingAssignments.map((a) => a.organizationId)),
    ];

    for (const orgId of dirtyOrgIds) {
      const assignmentsForOrg = pendingAssignments.filter(
        (a) => a.organizationId === orgId,
      );
      for (const assignment of assignmentsForOrg) {
        await syncService.trySync(
          db.organizationDimensions,
          assignment,
          async () => {
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

            await organizationDimensionRepository.updateAssignmentSyncStatus(
              assignment.id,
              SyncStatus.SYNCED,
            );
          },
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
