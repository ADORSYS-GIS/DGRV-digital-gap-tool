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

  // Only updates IndexedDB — used when syncing FROM the backend (no API call)
  async syncFromRemote(
    organizationId: string,
    dimensionIds: string[],
  ): Promise<void> {
    const now = new Date();
    // Clear existing synced assignments and replace with remote data
    await db.organizationDimensions
      .where("organizationId")
      .equals(organizationId)
      .filter((od) => od.syncStatus === SyncStatus.SYNCED)
      .delete();

    const newAssignments: OrganizationDimension[] = dimensionIds.map((dimensionId) => ({
      id: uuidv4(),
      organizationId,
      dimensionId,
      syncStatus: SyncStatus.SYNCED,
      createdAt: now,
      updatedAt: now,
    }));

    if (newAssignments.length > 0) {
      await db.organizationDimensions.bulkPut(newAssignments);
    }
  },

  // Calls the API AND updates IndexedDB — used when user saves from the dialog
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
      // After successful API call, sync IndexedDB with the confirmed state
      await this.syncFromRemote(organizationId, dimensionIds);
      return;
    }

    // Offline: queue for later sync
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

        if (assignment) {
          if (!isAssigned && assignment.syncStatus !== SyncStatus.DELETED) {
            await db.organizationDimensions.update(assignment.id, {
              syncStatus: SyncStatus.DELETED,
              updatedAt: now,
            });
          } else if (isAssigned && assignment.syncStatus === SyncStatus.DELETED) {
            await db.organizationDimensions.update(assignment.id, {
              syncStatus: SyncStatus.UPDATED,
              updatedAt: now,
            });
          }
        } else if (isAssigned) {
          const newAssignment: OrganizationDimension = {
            id: uuidv4(),
            organizationId,
            dimensionId,
            syncStatus: SyncStatus.NEW,
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
