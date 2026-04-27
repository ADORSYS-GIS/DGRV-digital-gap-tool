import { useState, useEffect } from "react";
import { authService } from "@/services/shared/authService";
import { useAuth } from "@/context/AuthContext";
import { getOrganizations } from "@/openapi-client/services.gen";

export const useOrganizationId = (): string | null => {
  const { isAuthenticated, loading, user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    // Try immediately from current auth state (works when already authenticated)
    const tryResolve = async () => {
      // 1. Try from live token claim
      const id = authService.getOrganizationId();
      if (id) {
        setOrganizationId(id);
        return;
      }

      // 2. Try from user profile in AuthContext
      if (user?.organization) {
        setOrganizationId(user.organization);
        return;
      }

      // 3. Offline fallback: read directly from cached profile in IndexedDB
      if (!navigator.onLine || !isAuthenticated) {
        try {
          const { get } = await import("idb-keyval");
          const cachedProfile = await get("auth_profile");
          if (cachedProfile?.organization) {
            setOrganizationId(cachedProfile.organization);
            return;
          }
          // Also try parsing the cached token directly
          const cachedTokens = await get("auth_tokens");
          if (cachedTokens?.accessToken) {
            try {
              const payload = JSON.parse(atob(cachedTokens.accessToken.split('.')[1]));
              const orgs = payload.organization || payload.organizations;
              if (orgs) {
                const orgName = Object.keys(orgs)[0];
                if (orgName && orgs[orgName]?.id) {
                  setOrganizationId(orgs[orgName].id);
                  return;
                }
              }
            } catch {
              // ignore parse errors
            }
          }
        } catch {
          // ignore
        }
        return;
      }

      // 4. Online fallback: fetch from API if org_admin/coop_admin/coop_user
      if (isAuthenticated && !loading) {
        const roles = user?.roles || [];
        const needsOrgFallback = roles.some(r =>
          ["org_admin", "coop_admin", "coop_user"].includes(r.toLowerCase())
        );
        if (needsOrgFallback && user?.sub) {
          getOrganizations()
            .then((orgs) => {
              if (!orgs || orgs.length === 0) return;
              if (orgs.length === 1 && orgs[0]?.id) {
                setOrganizationId(orgs[0].id);
              }
            })
            .catch((err) => {
              console.error("Failed to fetch organization for user:", err);
            });
        }
      }
    };

    tryResolve();
  }, [isAuthenticated, loading, user]);

  return organizationId;
};
