import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/shared/authService";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { useAuth } from "@/hooks/useAuth";

/**
 * Resolve a cooperation ID from the cooperation path stored in the ID token.
 * - Reads the cooperation path from the token (authService.getCooperationPath)
 * - Calls getGroupByPath via cooperationRepository to fetch the cooperation
 * - Returns the resolved cooperation ID (or null) plus loading/error states
 *
 * Use this for coop-admin flows where the URL does not yet include :cooperationId.
 */
export const useCooperationIdFromPath = () => {
  const { user } = useAuth();
  const userSub = user?.sub ?? null;
  
  const cooperationPath = useMemo(
    () => {
      // Try live token first
      const livePath = authService.getCooperationPath();
      if (livePath) return livePath;
      // Fall back to user profile from AuthContext (populated from cache offline)
      return (user as any)?.cooperation_path ?? null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userSub, user],
  );

  const query = useQuery({
    queryKey: ["cooperationIdFromPath", cooperationPath],
    enabled: Boolean(cooperationPath),
    staleTime: 5 * 60 * 1000, // 5 minutes — don't refetch on every render
    queryFn: async () => {
      if (!cooperationPath) return null;
      const cooperation =
        await cooperationRepository.getByPath(cooperationPath);
      return cooperation ? { id: cooperation.id, name: cooperation.name } : null;
    },
  });

  return {
    cooperationPath,
    cooperationId: query.data?.id ?? null,
    cooperationName: query.data?.name ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};
