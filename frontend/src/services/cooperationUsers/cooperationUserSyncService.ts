import {
  addMember,
  deleteUser,
  getGroupMembers,
} from "@/openapi-client/services.gen";
import { db } from "@/services/db";
import { cooperationUserRepository } from "./cooperationUserRepository";
import { CooperationUser } from "@/types/cooperationUser";
import { SyncStatus } from "@/types/sync";
import { syncService } from "../sync/syncService";

interface Role {
  name: string;
}

export const cooperationUserSyncService = {
  async fetchAndStoreUsers(cooperationId: string) {
    const remoteUsers = await getGroupMembers({ groupId: cooperationId });
    const localUsers = remoteUsers.map((user) => {
      const roles =
        user.roles && Array.isArray(user.roles)
          ? user.roles.map((role: Role) => role.name)
          : [];
      return {
        ...user,
        roles,
        cooperationId,
        syncStatus: SyncStatus.SYNCED,
      } as CooperationUser;
    });
    await cooperationUserRepository.clear();
    await cooperationUserRepository.bulkAdd(localUsers);
    return localUsers;
  },

  async add(user: CooperationUser) {
    if (!user.email) {
      throw new Error("Email is required to add a user.");
    }
    await addMember({
      groupId: user.cooperationId,
      requestBody: {
        email: user.email || "",
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
        roles: user.roles,
        // Pass through any assigned dimensions so they can be stored as
        // Keycloak user attributes.
        dimension_ids: user.dimensionIds ?? null,
      },
    });
    await cooperationUserRepository.updateSyncStatus(
      user.id,
      SyncStatus.SYNCED,
    );
  },

  async delete(user: CooperationUser) {
    await deleteUser({ userId: user.id });
    await cooperationUserRepository.delete(user.id);
  },

  async sync() {
    const pendingUsers = await db.cooperationUsers
      .where("syncStatus")
      .notEqual(SyncStatus.SYNCED)
      .toArray();

    for (const user of pendingUsers) {
      await syncService.trySync(db.cooperationUsers, user, async () => {
        if (user.syncStatus === SyncStatus.NEW) {
          await this.add(user);
        } else if (user.syncStatus === SyncStatus.DELETED) {
          await this.delete(user);
        }
      });
    }
  },
};
