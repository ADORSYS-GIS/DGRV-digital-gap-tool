import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/shared/authService";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";

/**
 * Resolve a cooperation ID from the cooperation path stored in the ID token.
 * - Reads the cooperation path from the token (authService.getCooperationPath)
 * - Calls getGroupByPath via cooperationRepository to fetch the cooperation
 * - Returns the resolved cooperation ID (or null) plus loading/error states
 *
 * Use this for coop-admin flows where the URL does not yet include :cooperationId.
 */
export const useCooperationIdFromPath = () => {
  const cooperationPath = useMemo(() => authService.getCooperationPath(), []);

  const query = useQuery({
    queryKey: ["cooperationIdFromPath", cooperationPath],
    enabled: Boolean(cooperationPath),
    queryFn: async () => {
      if (!cooperationPath) return null;
      // The path may come with a leading '/', keep as-is because the API expects the path string
      const cooperation =
        await cooperationRepository.getByPath(cooperationPath);
      return cooperation?.id ?? null;
    },
  });

  return {
    cooperationPath,
    cooperationId: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};
