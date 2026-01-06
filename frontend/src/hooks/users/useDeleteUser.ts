import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userRepository } from "@/services/users/userRepository";
import { UserWithSync } from "@/types/types";

export const useDeleteUser = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userRepository.deleteUser(userId, orgId),
    onMutate: async (userIdToDelete) => {
      await queryClient.cancelQueries({
        queryKey: ["organizationMembers", orgId],
      });

      const previousMembers =
        queryClient.getQueryData<UserWithSync[]>([
          "organizationMembers",
          orgId,
        ]) || [];

      queryClient.setQueryData<UserWithSync[]>(
        ["organizationMembers", orgId],
        previousMembers.filter((user) => user.id !== userIdToDelete),
      );

      return { previousMembers };
    },
    onError: (err, userId, context) => {
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
    },
  });
};
