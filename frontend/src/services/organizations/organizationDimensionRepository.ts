import { db } from "@/services/db";
import { OrganizationDimension } from "@/types/organizationDimension";
import { SyncStatus } from "@/types/sync";
import { v4 as uuidv4 } from "uuid";
import { updateOrganizationDimensions } from "@/openapi-client/services.gen";

export const organizationDimensionRepository = {
  async getDimensionsByOrganizationId(
    organizationId: string,
  ): Promise<string[]> {
    const dimensions = await db.organizationDimensions
      .where("organizationId")
      .equals(organizationId)
      .filter((od) => od.syncStatus !== SyncStatus.DELETED)
      .toArray();
    return dimensions.map((d) => d.dimensionId);
  },

  async setAssignedDimensions(
    organizationId: string,
    dimensionIds: string[],
  ): Promise<void> {
    const now = new Date();

    // Call the backend API directly when online
    if (navigator.onLine) {
      await updateOrganizationDimensions({
        orgId: organizationId,
        requestBody: { dimension_ids: dimensionIds },
      });
    }

    const existingAssignments = await db.organizationDimensions
      .where("organizationId")
      .equals(organizationId)
      .toArray();

    const newDimensionIds = new Set(dimensionIds);

    const dimensionsToProcess = new Set([
      ...dimensionIds,
      ...existingAssignments.map((a) => a.dimensionId),
    ]);

    await db.transaction("rw", db.organizationDimensions, async () => {
      for (const dimensionId of dimensionsToProcess) {
        const assignment = existingAssignments.find(
          (a) => a.dimensionId === dimensionId,
        );
        const isAssigned = newDimensionIds.has(dimensionId);
        const syncStatus = navigator.onLine ? SyncStatus.SYNCED : SyncStatus.NEW;

        if (assignment) {
          if (!isAssigned && assignment.syncStatus !== SyncStatus.DELETED) {
            await db.organizationDimensions.update(assignment.id, {
              syncStatus: navigator.onLine ? SyncStatus.DELETED : SyncStatus.DELETED,
              updatedAt: now,
            });
          } else if (isAssigned && assignment.syncStatus === SyncStatus.DELETED) {
            await db.organizationDimensions.update(assignment.id, {
              syncStatus: navigator.onLine ? SyncStatus.SYNCED : SyncStatus.UPDATED,
              updatedAt: now,
            });
          } else if (isAssigned) {
            await db.organizationDimensions.update(assignment.id, {
              syncStatus: navigator.onLine ? SyncStatus.SYNCED : assignment.syncStatus,
              updatedAt: now,
            });
          }
        } else if (isAssigned) {
          const newAssignment: OrganizationDimension = {
            id: uuidv4(),
            organizationId,
            dimensionId,
            syncStatus: navigator.onLine ? SyncStatus.SYNCED : SyncStatus.NEW,
            createdAt: now,
            updatedAt: now,
          };
          await db.organizationDimensions.add(newAssignment);
        }
      }
    });
  },

  async getDirtyAssignments(): Promise<OrganizationDimension[]> {
    return db.organizationDimensions
      .where("syncStatus")
      .anyOf(SyncStatus.NEW, SyncStatus.UPDATED, SyncStatus.DELETED)
      .toArray();
  },

  async updateAssignmentSyncStatus(
    id: string,
    syncStatus: SyncStatus,
  ): Promise<void> {
    await db.organizationDimensions.update(id, { syncStatus });
  },

  async clear(): Promise<void> {
    await db.organizationDimensions.clear();
  },
};
