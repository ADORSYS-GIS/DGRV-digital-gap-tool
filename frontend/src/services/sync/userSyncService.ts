import { db } from "@/services/db";
import { syncService } from "@/services/sync/syncService";
import { userRepository } from "@/services/users/userRepository";
import { inviteUserToOrganization } from "@/openapi-client/services.gen";
import { UserInvitationRequest } from "@/openapi-client/types.gen";

interface InvitationPayload extends UserInvitationRequest {
  orgId: string;
  first_name?: string | null;
  last_name?: string | null;
}

export const userSyncService = {
  sync: async () => {
    const pendingInvitations = await db.sync_queue
      .where("entityType")
      .equals("UserInvitation")
      .toArray();

    for (const item of pendingInvitations) {
      try {
        if (item.action === "CREATE") {
          const payload = item.payload as InvitationPayload;
          await inviteUserToOrganization({
            orgId: payload.orgId,
            requestBody: {
              email: payload.email,
              first_name: payload.first_name ?? null,
              last_name: payload.last_name ?? null,
              roles: payload.roles,
            },
          });
          await userRepository.markAsSynced(item.entityId, item.entityId);
        }
        await db.sync_queue.delete(item.id!);
      } catch (error) {
        console.error("Failed to sync user invitation:", error);
        await userRepository.markAsFailed(
          item.entityId,
          (error as Error).message,
        );
      }
    }
  },
};