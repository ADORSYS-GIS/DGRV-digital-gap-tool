import {
  addMember,
  deleteUser,
  getGroupMembers,
  resendMemberVerificationEmail,
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
    // Offline: return cached users immediately
    if (!navigator.onLine) {
      return cooperationUserRepository.getAllByCooperationId(cooperationId);
    }
    try {
      const remoteUsers = await getGroupMembers({ groupId: cooperationId });
      const localUsers = remoteUsers.map((user) => {
        const roles =
          user.roles && Array.isArray(user.roles)
            ? user.roles.map((role: Role) => role.name)
            : [];

        // Extract assigned_dimensions from Keycloak user attributes
        const attrs = user.attributes as Record<string, string[]> | undefined;
        const dimensionIds = attrs?.assigned_dimensions ?? [];

        return {
          ...user,
          roles,
          dimensionIds,
          cooperationId,
          syncStatus: SyncStatus.SYNCED,
        } as CooperationUser;
      });
      await cooperationUserRepository.clear();
      await cooperationUserRepository.bulkAdd(localUsers);
      return localUsers;
    } catch (error) {
      console.error("Failed to fetch cooperation users from API:", error);
      // Fall back to cached data
      return cooperationUserRepository.getAllByCooperationId(cooperationId);
    }
  },

  async add(user: CooperationUser) {
    if (!user.email) {
      throw new Error("Email is required to add a user.");
    }
    const result = await addMember({
      groupId: user.cooperationId,
      requestBody: {
        email: user.email || "",
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
        roles: user.roles,
        dimension_ids: user.dimensionIds ?? null,
      },
    });
    await cooperationUserRepository.updateSyncStatus(
      user.id,
      SyncStatus.SYNCED,
    );
    // Return result so callers can check email_sent status
    return result as { user_id: string; email: string; email_sent: boolean; message: string } | undefined;
  },

  async resendVerificationEmail(userId: string, groupId: string) {
    await resendMemberVerificationEmail({ groupId, userId });
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
