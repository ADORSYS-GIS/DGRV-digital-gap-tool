import { db } from "@/services/db";
import { Cooperation } from "@/types/cooperation";
import { v4 as uuidv4 } from "uuid";
import { cooperationSyncService } from "@/services/sync/cooperationSyncService";
import { getGroupByPath } from "@/openapi-client";

export const cooperationRepository = {
  async getAll(organizationId?: string) {
    if (organizationId) {
      await cooperationSyncService.sync(organizationId);
    }
    return await db.cooperations.toArray();
  },

  async getById(id: string) {
    return await db.cooperations.get(id);
  },

  async getByPath(path: string): Promise<Cooperation | undefined> {
    try {
      // The generated client returns a KeycloakGroup, which is compatible with Cooperation
      const cooperation = (await getGroupByPath({
        path,
      })) as Cooperation;
      return cooperation;
    } catch (error) {
      console.error(`Failed to fetch cooperation with path ${path}:`, error);
      return undefined;
    }
  },

  async add(
    cooperation: Omit<Cooperation, "id" | "syncStatus">,
    organizationId?: string,
  ) {
    const newCooperation: Cooperation = {
      ...cooperation,
      id: uuidv4(),
      syncStatus: "new",
    };
    await db.cooperations.add(newCooperation);
    if (organizationId) {
      await cooperationSyncService.sync(organizationId);
    } else {
      console.warn("Organization ID not provided, cooperation sync may fail");
      await cooperationSyncService.sync("");
    }
    return newCooperation;
  },

  async update(
    id: string,
    updates: Partial<Omit<Cooperation, "id" | "syncStatus">>,
    organizationId?: string,
  ): Promise<Cooperation | undefined> {
    const cooperation = await db.cooperations.get(id);
    if (!cooperation) {
      console.warn(`Cooperation with ID ${id} not found`);
      return undefined;
    }

    const updatedCooperation = {
      ...cooperation,
      ...updates,
      syncStatus: "updated" as const,
    };

    await db.cooperations.put(updatedCooperation);

    if (organizationId) {
      await cooperationSyncService.sync(organizationId);
    } else {
      console.warn("Organization ID not provided, cooperation sync may fail");
      await cooperationSyncService.sync("");
    }

    return updatedCooperation;
  },

  async delete(id: string, organizationId?: string) {
    const cooperation = await db.cooperations.get(id);
    if (cooperation) {
      await db.cooperations.update(id, { syncStatus: "deleted" });
      if (organizationId) {
        await cooperationSyncService.sync(organizationId);
      } else {
        console.warn("Organization ID not provided, cooperation sync may fail");
        await cooperationSyncService.sync("");
      }
    }
  },
};
