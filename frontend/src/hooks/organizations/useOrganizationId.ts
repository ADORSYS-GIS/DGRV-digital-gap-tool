import { useState, useEffect } from "react";
import { authService } from "@/services/shared/authService";
import { useAuth } from "@/context/AuthContext";

export const useOrganizationId = (): string | null => {
  const { isAuthenticated, loading } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const id = authService.getOrganizationId();
      setOrganizationId(id);
    }
  }, [isAuthenticated, loading]);

  return organizationId;
};
