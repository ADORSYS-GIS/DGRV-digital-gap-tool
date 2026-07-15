import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cooperationUserRepository } from "@/services/cooperationUsers/cooperationUserRepository";
import { useOnlineStatus } from "../shared/useOnlineStatus";
import { cooperationUserSyncService } from "@/services/cooperationUsers/cooperationUserSyncService";
import { AddCooperationUser } from "@/types/cooperationUser";
import { syncManager } from "@/services/sync/syncManager";

export const useAddCooperationUser = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (data: {
      user: AddCooperationUser;
      cooperationId: string;
    }) => {
      const { user, cooperationId } = data;
      if (!cooperationId) throw new Error("Cooperation ID is not defined");
      const newUser = await cooperationUserRepository.add(cooperationId, user);
      if (isOnline) {
        const result = await cooperationUserSyncService.add(newUser);
        return { newUser, emailSent: result?.email_sent ?? true };
      }
      return { newUser, emailSent: true };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["cooperationUsers", variables.cooperationId],
      });
      syncManager.syncAll(null);
    },
  });
};
