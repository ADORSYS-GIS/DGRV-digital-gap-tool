import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userRepository } from "@/services/users/userRepository";
import { UserInvitationRequest } from "@/openapi-client/types.gen";

export const useInviteUser = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitation: Omit<UserInvitationRequest, "id">) =>
      userRepository.inviteUser(orgId, invitation),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizationMembers", orgId],
      });
    },
  });
};
