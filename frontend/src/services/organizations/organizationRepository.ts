import {
  createOrganization,
  getOrganizations,
} from "@/openapi-client/services.gen";
import { Organization } from "@/types/organization";
import { db } from "../db";
import { syncService } from "../sync/syncService";

export const organizationRepository = {
  async getAll() {
    try {
      if (navigator.onLine) {
        const backendOrganizations = await getOrganizations();
        if (backendOrganizations) {
          await db.organizations.clear();
          const syncedOrganizations = backendOrganizations.map((org) => ({
            ...org,
            id: org.id || "",
            domain: org.domains?.[0]?.name || "",
            description:
              (org.attributes as { description: string[] })?.description?.[0] ||
              org.description ||
              "",
            syncStatus: "synced" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          await db.organizations.bulkAdd(syncedOrganizations);
        }
      }
    } catch (error) {
      console.error("Failed to sync organizations from backend:", error);
    }
    return db.organizations
      .filter((org) => org.syncStatus !== "deleted")
      .toArray();
  },

  async getById(id: string) {
    return db.organizations.get(id);
  },

  async add(
    organization: Omit<
      Organization,
      "id" | "syncStatus" | "createdAt" | "updatedAt"
    >,
  ) {
    if (navigator.onLine) {
      try {
        const response = await createOrganization({
          requestBody: {
            name: organization.name,
            domains: [{ name: organization.domain }],
            redirectUrl: "http://localhost:8000/",
            enabled: "true",
            attributes: {
              description: [organization.description],
            },
          },
        });

        const newOrg: Organization = {
          id: response.id,
          name: response.name,
          domain: response.domains?.[0]?.name || "",
          description: organization.description,
          syncStatus: "synced",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.organizations.add(newOrg);
        return newOrg;
      } catch (error) {
        console.error("Failed to create organization on server:", error);
        throw error;
      }
    } else {
      const newOrg: Organization = {
        id: crypto.randomUUID(),
        ...organization,
        syncStatus: "new",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.organizations.add(newOrg);
      await syncService.addToSyncQueue(
        "Organization",
        newOrg.id,
        "CREATE",
        newOrg,
      );
      return newOrg;
    }
  },

  async update(id: string, updates: Partial<Organization>) {
    const organization = await db.organizations.get(id);
    if (organization) {
      const updatedOrganization = { ...organization, ...updates };
      await db.organizations.update(id, {
        ...updates,
        syncStatus: "updated",
        updatedAt: new Date().toISOString(),
      });
      await syncService.addToSyncQueue(
        "Organization",
        id,
        "UPDATE",
        updatedOrganization,
      );
      return updatedOrganization;
    }
  },

  async delete(id: string) {
    await db.organizations.update(id, {
      syncStatus: "deleted",
      updatedAt: new Date().toISOString(),
    });
    await syncService.addToSyncQueue("Organization", id, "DELETE", { id });
  },

  async markAsSynced(localId: string, serverId: string) {
    const item = await db.organizations.get(localId);
    if (!item) return;

    console.log(
      `Syncing organization: localId=${localId}, serverId=${serverId}`,
    );

    // Prepare the synced data, ensuring syncError is removed
    const syncedData: Partial<Organization> & {
      syncError?: string | undefined;
    } = {
      syncStatus: "synced",
      updatedAt: new Date().toISOString(),
    };
    delete syncedData.syncError;

    if (localId !== serverId) {
      // The local ID was temporary, so we replace the local item with the server-authoritative one
      await db.organizations.delete(localId);
      const newItem: Organization = {
        ...item,
        id: serverId, // Use the ID from the server
        ...syncedData,
      };
      await db.organizations.add(newItem);
      console.log(
        `Organization ${localId} synced and replaced with ${serverId}`,
      );
    } else {
      // The item already has the correct ID, just update its sync status
      await db.organizations.update(localId, syncedData);
      console.log(`Organization ${localId} marked as synced`);
    }
  },

  async markAsFailed(id: string, error: string) {
    await db.organizations.update(id, {
      syncStatus: "failed",
      syncError: error,
      updatedAt: new Date().toISOString(),
    });
  },
};
