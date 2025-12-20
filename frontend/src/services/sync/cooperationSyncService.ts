import {
  createGroup,
  deleteGroup,
  getGroupsByOrganization,
  updateGroup,
} from "@/openapi-client";
import { KeycloakGroup } from "@/openapi-client/types.gen";
import { db } from "@/services/db";
import { Cooperation } from "@/types/cooperation";
import { SyncStatus } from "@/types/sync";
import { syncService } from "./syncService";

const mapRemoteCooperationToLocal = (
  cooperation: KeycloakGroup,
): Cooperation => ({
  id: cooperation.id,
  name: cooperation.name,
  description: cooperation.description || "",
  path: cooperation.path,
  domains: [],
  syncStatus: SyncStatus.SYNCED,
  syncRetries: 0,
});

export const cooperationSyncService = {
  async sync(organizationId: string) {
    if (!navigator.onLine) {
      console.log("Offline, skipping cooperation sync.");
      return;
    }

    if (!organizationId) {
      console.error("Organization ID not provided, skipping sync.");
      return;
    }

    const pendingCreations = await db.cooperations
      .where("syncStatus")
      .equals(SyncStatus.NEW)
      .toArray();
    for (const cooperation of pendingCreations) {
      await syncService.trySync(db.cooperations, cooperation, async () => {
        const { id, syncStatus, ...payload } = cooperation;
        const response = await createGroup({
          orgId: organizationId,
          requestBody: {
            name: payload.name,
            description: payload.description,
          },
        });
        await db.cooperations.delete(id);
        await db.cooperations.add(mapRemoteCooperationToLocal(response));
      });
    }

    const pendingUpdates = await db.cooperations
      .where("syncStatus")
      .equals(SyncStatus.UPDATED)
      .toArray();
    for (const cooperation of pendingUpdates) {
      await syncService.trySync(db.cooperations, cooperation, async () => {
        const { syncStatus, ...payload } = cooperation;
        await updateGroup({
          groupId: cooperation.id,
          requestBody: {
            name: payload.name,
            description: payload.description,
          },
        });
        await db.cooperations.update(cooperation.id, {
          syncStatus: SyncStatus.SYNCED,
          syncRetries: 0,
        });
      });
    }

    const pendingDeletions = await db.cooperations
      .where("syncStatus")
      .equals(SyncStatus.DELETED)
      .toArray();
    for (const cooperation of pendingDeletions) {
      await syncService.trySync(db.cooperations, cooperation, async () => {
        await deleteGroup({ groupId: cooperation.id });
        await db.cooperations.delete(cooperation.id);
      });
    }

    const remoteCooperations = await getGroupsByOrganization({
      orgId: organizationId,
    });
    const localCooperations = remoteCooperations.map(
      mapRemoteCooperationToLocal,
    );
    const remoteIds = new Set(localCooperations.map((c) => c.id));

    const cooperationsToDelete = await db.cooperations
      .where("syncStatus")
      .equals(SyncStatus.SYNCED)
      .filter((c) => !remoteIds.has(c.id))
      .toArray();

    if (cooperationsToDelete.length > 0) {
      const idsToDelete = cooperationsToDelete.map((c) => c.id);
      await db.cooperations.bulkDelete(idsToDelete);
    }

    await db.cooperations.bulkPut(localCooperations);
  },
};
