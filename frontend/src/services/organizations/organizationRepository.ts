import { db } from "../db";
import { Organization } from "@/types/organization";

export const organizationRepository = {
  async getAll() {
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
    const newOrg: Organization = {
      id: crypto.randomUUID(),
      ...organization,
      syncStatus: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.organizations.add(newOrg);
    return newOrg;
  },

  async update(id: string, updates: Partial<Organization>) {
    await db.organizations.update(id, {
      ...updates,
      syncStatus: "updated",
      updatedAt: new Date().toISOString(),
    });
    return db.organizations.get(id);
  },

  async delete(id: string) {
    // We'll implement a soft delete by default
    await db.organizations.update(id, {
      syncStatus: "deleted",
      updatedAt: new Date().toISOString(),
    });
  },
};
