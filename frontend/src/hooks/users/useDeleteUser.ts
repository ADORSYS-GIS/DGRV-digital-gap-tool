import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userRepository } from "@/services/users/userRepository";

export const useDeleteUser = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userRepository.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizationMembers", orgId],
      });
    },
  });
};
