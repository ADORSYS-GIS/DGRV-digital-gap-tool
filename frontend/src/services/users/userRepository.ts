import { db } from "@/services/db";
import {
  inviteUserToOrganization,
  getOrganizationMembers,
  deleteUser,
} from "@/openapi-client/services.gen";
import type {
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
      throw error;
    }
  }

  async getMembers(orgId: string): Promise<UserWithSync[]> {
    if (navigator.onLine) {
      try {
        const members = await getOrganizationMembers({ orgId });
        // Always return fresh data from backend directly, mapped with required fields
        const freshUsers: UserWithSync[] = members.map((member) => ({
          ...member,
          orgId,
          syncStatus: SyncStatus.SYNCED,
        }));
        // Sync to IndexedDB in background
        await db.users.where("orgId").equals(orgId)
          .filter((u) => u.syncStatus !== SyncStatus.PENDING)
          .delete();
        if (freshUsers.length > 0) {
          await db.users.bulkPut(freshUsers);
        }
        return freshUsers;
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

  async deleteUser(userId: string): Promise<void> {
    if (!userId || userId === "undefined") {
      throw new Error("Invalid user ID");
    }
    try {
      await deleteUser({ userId });
      await db.users.delete(userId);
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw new Error("Failed to delete user. Please try again later.");
    }
  }
}

export const userRepository = new UserRepository();
