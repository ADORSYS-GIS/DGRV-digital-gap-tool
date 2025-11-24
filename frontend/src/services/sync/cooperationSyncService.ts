import {
  createGroup,
  deleteGroup,
  getGroupsByOrganization,
  updateGroup,
} from "@/openapi-client";
import { KeycloakGroup } from "@/openapi-client/types.gen";
import { db } from "@/services/db";
import { Cooperation } from "@/types/cooperation";

const mapRemoteCooperationToLocal = (
  cooperation: KeycloakGroup,
): Cooperation => ({
  id: cooperation.id,
  name: cooperation.name,
  description: cooperation.description || "",
  path: cooperation.path,
  domains: [],
  syncStatus: "synced" as const,
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
      .equals("new")
      .toArray();
    for (const cooperation of pendingCreations) {
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
    }

    const pendingUpdates = await db.cooperations
      .where("syncStatus")
      .equals("updated")
      .toArray();
    for (const cooperation of pendingUpdates) {
      const { syncStatus, ...payload } = cooperation;
      await updateGroup({
        groupId: cooperation.id,
        requestBody: {
          name: payload.name,
          description: payload.description,
        },
      });
      await db.cooperations.update(cooperation.id, { syncStatus: "synced" });
    }

    const pendingDeletions = await db.cooperations
      .where("syncStatus")
      .equals("deleted")
      .toArray();
    for (const cooperation of pendingDeletions) {
      await deleteGroup({ groupId: cooperation.id });
      await db.cooperations.delete(cooperation.id);
    }

    const remoteCooperations = await getGroupsByOrganization({
      orgId: organizationId,
    });
    const localCooperations = remoteCooperations.map(
      mapRemoteCooperationToLocal,
    );
    await db.cooperations.bulkPut(localCooperations);
  },
};
