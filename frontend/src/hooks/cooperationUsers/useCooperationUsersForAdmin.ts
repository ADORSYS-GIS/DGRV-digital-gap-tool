import { useQuery } from "@tanstack/react-query";
import { cooperationUserRepository } from "@/services/cooperationUsers/cooperationUserRepository";
import { cooperationUserSyncService } from "@/services/cooperationUsers/cooperationUserSyncService";
import { useCooperationIdFromPath } from "@/hooks/cooperations/useCooperationIdFromPath";
import { useOnlineStatus } from "@/hooks/shared/useOnlineStatus";

/**
 * Fetches cooperation users using the cooperation ID resolved from the token
 * (via useCooperationIdFromPath), NOT from URL params.
 *
 * Use this in pages where :cooperationId is not present in the route
 * (e.g. assessment answering pages for coop_admin).
 */
export const useCooperationUsersForAdmin = () => {
  const { cooperationId } = useCooperationIdFromPath();
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
    staleTime: 2 * 60 * 1000,
  });
};
