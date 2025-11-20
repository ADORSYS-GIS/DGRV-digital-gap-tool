import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cooperationUserRepository } from "@/services/cooperationUsers/cooperationUserRepository";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useOnlineStatus } from "../shared/useOnlineStatus";
import { cooperationUserSyncService } from "@/services/cooperationUsers/cooperationUserSyncService";
import { AddCooperationUser } from "@/types/cooperationUser";
import { syncManager } from "@/services/sync/syncManager";

export const useAddCooperationUser = () => {
  const queryClient = useQueryClient();
  const cooperationId = useCooperationId();
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (user: AddCooperationUser) => {
      if (!cooperationId) throw new Error("Cooperation ID is not defined");
      const newUser = await cooperationUserRepository.add(cooperationId, user);
      if (isOnline) {
        await cooperationUserSyncService.add(newUser);
      }
      return newUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cooperationUsers", cooperationId],
      });
    },
  });
};
