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
    const invitationWithId = {
      ...invitation,
      id: uuidv4(),
      orgId: orgId,
      syncStatus: SyncStatus.PENDING,
    };

    // This is a temporary solution until a proper table for invitations is created.
    // We will add it to the user table for now to track the sync status.
    // A proper implementation would have an `invitations` table in Dexie.
    const temporaryUserForSync = {
      id: invitationWithId.id,
      email: invitation.email,
      orgId: orgId,
      syncStatus: SyncStatus.PENDING,
      username: invitation.email,
    };

    await db.users.add(temporaryUserForSync as UserWithSync);

    await syncService.addToSyncQueue(
      "UserInvitation",
      invitationWithId.id,
      "CREATE",
      { ...invitation, orgId },
    );
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
    const userToDelete = await db.users.get(userId);
    if (userToDelete) {
      await db.users.delete(userId);
    }

    await syncService.addToSyncQueue("User", userId, "DELETE", {
      id: userId,
      orgId: orgId,
    });
  }
}

export const userRepository = new UserRepository();
