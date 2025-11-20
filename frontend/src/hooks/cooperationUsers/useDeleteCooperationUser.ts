import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cooperationUserRepository } from "@/services/cooperationUsers/cooperationUserRepository";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useOnlineStatus } from "../shared/useOnlineStatus";
import { cooperationUserSyncService } from "@/services/cooperationUsers/cooperationUserSyncService";

export const useDeleteCooperationUser = () => {
  const queryClient = useQueryClient();
  const cooperationId = useCooperationId();
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (userId: string) => {
      const user = await cooperationUserRepository.getById(userId);
      if (!user) throw new Error("User not found");

      await cooperationUserRepository.delete(userId);

      if (isOnline) {
        await cooperationUserSyncService.delete(user);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cooperationUsers", cooperationId],
      });
    },
  });
};
