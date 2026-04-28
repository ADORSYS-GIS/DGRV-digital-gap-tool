import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userRepository } from "@/services/users/userRepository";
import { UserInvitationRequest } from "@/openapi-client/types.gen";
import { UserWithSync, SyncStatus } from "@/types/types";
import { v4 as uuidv4 } from "uuid";

export const useInviteUser = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitation: Omit<UserInvitationRequest, "id">) =>
      userRepository.inviteUser(orgId, invitation),
    onMutate: async (newInvitation) => {
      await queryClient.cancelQueries({
        queryKey: ["organizationMembers", orgId],
      });

      const previousMembers =
        queryClient.getQueryData<UserWithSync[]>([
          "organizationMembers",
          orgId,
        ]) || [];

      const optimisticUser: UserWithSync = {
        id: uuidv4(),
        email: newInvitation.email!,
        firstName: newInvitation.first_name || "",
        lastName: newInvitation.last_name || "",
        roles: newInvitation.roles,
        orgId: orgId,
        syncStatus: SyncStatus.PENDING,
        username: newInvitation.email!,
      };

      queryClient.setQueryData<UserWithSync[]>(
        ["organizationMembers", orgId],
        [...previousMembers, optimisticUser],
      );

      return { previousMembers };
    },
    onError: (_err, _newInvitation, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          ["organizationMembers", orgId],
          context.previousMembers,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizationMembers", orgId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizationInvitations", orgId],
      });
    },
  });
};
