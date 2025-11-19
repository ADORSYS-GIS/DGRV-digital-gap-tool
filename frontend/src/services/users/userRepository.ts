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
        await db.users.where("orgId").equals(orgId).delete();
        const membersWithOrgId = members.map((member) => ({
          ...member,
          orgId,
          syncStatus: SyncStatus.SYNCED,
        }));
        await db.users.bulkPut(membersWithOrgId as UserWithSync[]);
        return this.getMembersOffline(orgId);
      } catch (error) {
        console.error("Failed to fetch organization members:", error);
        return this.getMembersOffline(orgId);
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

  async deleteUser(userId: string): Promise<void> {
    // TODO: Add offline support for user deletion
    await deleteUser({ userId });
  }
}

export const userRepository = new UserRepository();
