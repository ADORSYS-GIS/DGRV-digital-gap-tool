import { db } from "@/services/db";
import {
  inviteUserToOrganization,
  getOrganizationMembers,
  deleteUser,
} from "@/openapi-client/services.gen";
import type {
  KeycloakUser,
  UserInvitationRequest,
} from "@/openapi-client/types.gen";
import { syncService } from "@/services/sync/syncService";
import { v4 as uuidv4 } from "uuid";
import { SyncStatus } from "@/types/sync/index";
import { KeycloakUser as UserWithSync } from "@/types/user";

class UserRepository {
  async inviteUser(
    orgId: string,
    invitation: Omit<UserInvitationRequest, "id">,
  ): Promise<void> {
    try {
      await inviteUserToOrganization({
        orgId,
        requestBody: invitation,
      });
    } catch (error) {
      throw new Error("Failed to send invitation. Please try again later.");
    }
  }

  async getMembers(orgId: string): Promise<UserWithSync[]> {
    if (navigator.onLine) {
      try {
        const members = await getOrganizationMembers({ orgId });
        const localUsers = await this.getMembersOffline(orgId);
        const localUsersMap = new Map(localUsers.map((u) => [u.id, u]));
        const backendUserIds = new Set(members.map((m) => m.id));

        const usersToPut = members
          .map((member) => {
            const localUser = localUsersMap.get(member.id);
            if (localUser && localUser.syncStatus === SyncStatus.PENDING) {
              return null;
            }
            return {
              ...member,
              orgId,
              syncStatus: SyncStatus.SYNCED,
            };
          })
          .filter((u) => u !== null) as UserWithSync[];

        const idsToDelete = localUsers
          .filter(
            (u) =>
              u.syncStatus !== SyncStatus.PENDING && !backendUserIds.has(u.id),
          )
          .map((u) => u.id);

        if (usersToPut.length > 0) {
          await db.users.bulkPut(usersToPut);
        }

        if (idsToDelete.length > 0) {
          await db.users.bulkDelete(idsToDelete);
        }
      } catch (error) {
        console.error("Failed to fetch organization members:", error);
      }
    }
    return this.getMembersOffline(orgId);
  }

  private async getMembersOffline(orgId: string): Promise<UserWithSync[]> {
    return db.users.where("orgId").equals(orgId).toArray();
  }

  async markAsSynced(offlineId: string, serverId: string): Promise<void> {
    await db.users.update(offlineId, {
      id: serverId,
      syncStatus: SyncStatus.SYNCED,
      lastError: "",
    });
  }

  async markAsFailed(id: string, error: string): Promise<void> {
    await db.users.update(id, {
      syncStatus: SyncStatus.FAILED,
      lastError: error,
    });
  }

  async deleteUser(userId: string, orgId: string): Promise<void> {
    try {
      await deleteUser(userId);
      await db.users.delete(userId);
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw new Error("Failed to delete user. Please try again later.");
    }
  }
}

export const userRepository = new UserRepository();
