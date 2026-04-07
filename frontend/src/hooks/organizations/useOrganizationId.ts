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

      // Fallback: if org_admin/coop_admin/coop_user but no org claim in token yet,
      // use the user's sub (Keycloak user ID) to find their organization
      const roles = user?.roles || [];
      const needsOrgFallback = roles.some(r =>
        ["org_admin", "coop_admin", "coop_user"].includes(r.toLowerCase())
      );
      if (needsOrgFallback && user?.sub) {
        getOrganizations()
          .then((orgs) => {
            if (!orgs || orgs.length === 0) return;
            // If only one org exists, use it
            if (orgs.length === 1 && orgs[0]?.id) {
              setOrganizationId(orgs[0].id);
              return;
            }
            // If multiple orgs, we can't safely guess — token claim is required
            console.warn(
              "Multiple organizations found but no org claim in token. " +
              "Ensure the 'organization' scope is in dgat-client default scopes " +
              "and the user has accepted their invitation."
            );
          })
          .catch((err) => {
            console.error("Failed to fetch organization for user:", err);
          });
      }
    }
  }, [isAuthenticated, loading, user]);

  return organizationId;
};
