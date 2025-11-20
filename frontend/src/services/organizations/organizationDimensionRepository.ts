import { db } from "@/services/db";
import { OrganizationDimension } from "@/types/organizationDimension";
import { SyncStatus } from "@/types/sync";
import { v4 as uuidv4 } from "uuid";

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
    const existingAssignments = await db.organizationDimensions
      .where("organizationId")
      .equals(organizationId)
      .toArray();

    const existingDimensionIds = new Set(
      existingAssignments
        .filter((a) => a.syncStatus !== SyncStatus.DELETED)
        .map((a) => a.dimensionId),
    );
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
          // It exists, check if it should be deleted or undeleted
          if (!isAssigned && assignment.syncStatus !== SyncStatus.DELETED) {
            await db.organizationDimensions.update(assignment.id, {
              syncStatus: SyncStatus.DELETED,
              updatedAt: now,
            });
          } else if (
            isAssigned &&
            assignment.syncStatus === SyncStatus.DELETED
          ) {
            await db.organizationDimensions.update(assignment.id, {
              syncStatus: SyncStatus.UPDATED,
              updatedAt: now,
            });
          }
        } else if (isAssigned) {
          // It's a new assignment
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
