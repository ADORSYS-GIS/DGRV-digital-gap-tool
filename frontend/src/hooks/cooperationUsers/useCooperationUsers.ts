import { useQuery } from "@tanstack/react-query";
import { cooperationUserRepository } from "@/services/cooperationUsers/cooperationUserRepository";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useOnlineStatus } from "../shared/useOnlineStatus";
import { cooperationUserSyncService } from "@/services/cooperationUsers/cooperationUserSyncService";

export const useCooperationUsers = () => {
  const cooperationId = useCooperationId();
  const isOnline = useOnlineStatus();

  return useQuery({
    queryKey: ["cooperationUsers", cooperationId],
    queryFn: async () => {
      if (!cooperationId) return [];
      if (isOnline) {
        return cooperationUserSyncService.fetchAndStoreUsers(cooperationId);
      }
      return cooperationUserRepository.getAllByCooperationId(cooperationId);
    },
    enabled: !!cooperationId,
  });
};
