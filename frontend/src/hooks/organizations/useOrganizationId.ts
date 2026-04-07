import { useState, useEffect } from "react";
import { authService } from "@/services/shared/authService";
import { useAuth } from "@/context/AuthContext";
import { getOrganizations } from "@/openapi-client/services.gen";

export const useOrganizationId = (): string | null => {
  const { isAuthenticated, loading, user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // First try from token claim
      const id = authService.getOrganizationId();
      if (id) {
        setOrganizationId(id);
        return;
      }

      // Also check user.organization set during auth
      if (user?.organization) {
        setOrganizationId(user.organization);
        return;
      }

      // Fallback: if org_admin but no org claim in token yet,
      // fetch organizations from backend and use the first one
      const roles = user?.roles || [];
      if (roles.includes("org_admin")) {
        getOrganizations()
          .then((orgs) => {
            if (orgs && orgs.length > 0 && orgs[0]?.id) {
              setOrganizationId(orgs[0].id);
            }
          })
          .catch((err) => {
            console.error("Failed to fetch organization for org_admin:", err);
          });
      }
    }
  }, [isAuthenticated, loading, user]);

  return organizationId;
};
