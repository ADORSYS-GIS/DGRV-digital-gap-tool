/**
 * Protected route component that handles authentication and authorization.
 * This component ensures that only authenticated users with the required roles
 * can access specific routes. It provides:
 * - Authentication checking with loading states
 * - Role-based access control
 * - Redirects for unauthenticated or unauthorized users
 * - Support for both wrapper and outlet patterns
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import React from "react";
import { ROLES } from "@/constants/roles";
import { get } from "idb-keyval";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  requireOrganization?: boolean;
  children?: React.ReactNode;
}

const NoOrganizationMessage: React.FC = React.memo(() => {
  React.useEffect(() => {
    console.log("NoOrganizationMessage: Rendered");
  }, []);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md text-center space-y-4 p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Organization Required
        </h2>
        <p className="text-muted-foreground">
          Your account has the Organization Admin role but is not yet linked to an
          organization. Please contact your system administrator to be added to an
          organization before accessing this area.
        </p>
      </div>
    </div>
  );
});

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const [hasCachedTokens, setHasCachedTokens] = React.useState<boolean | null>(null);
  // After a timeout, stop waiting for Keycloak and trust the cache
  const [offlineTimeout, setOfflineTimeout] = React.useState(false);

  React.useEffect(() => {
    get("auth_tokens").then((tokens: any) => {
      setHasCachedTokens(!!(tokens?.accessToken));
    }).catch(() => setHasCachedTokens(false));
  }, []);

  // If we have cached tokens but auth hasn't resolved after 3s, assume offline and proceed
  React.useEffect(() => {
    if (hasCachedTokens && !isAuthenticated) {
      const timer = setTimeout(() => setOfflineTimeout(true), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [hasCachedTokens, isAuthenticated]);

  const userRoles = React.useMemo(() => {
    if (!user) return [];
    return [...(user.roles || []), ...(user.realm_access?.roles || [])].map(
      (r) => r.toLowerCase(),
    );
  }, [user]);

  const hasRequiredRole = React.useMemo(() => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.some((role) => userRoles.includes(role.toLowerCase()));
  }, [userRoles, allowedRoles]);

  // Still resolving — show spinner, but not forever
  if ((loading || hasCachedTokens === null) && !offlineTimeout) {
    return <LoadingSpinner />;
  }

  // Not authenticated AND no cached tokens → redirect to home
  if (!isAuthenticated && !hasCachedTokens) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Have cached tokens but Keycloak hasn't resolved — waiting (with timeout fallback)
  if (!isAuthenticated && hasCachedTokens && !offlineTimeout) {
    return <LoadingSpinner />;
  }

  // offlineTimeout hit OR isAuthenticated — proceed with whatever user we have
  // For offline timeout case, try to get user from cached profile
  const effectiveUser = user;

  const isAdmin = userRoles.includes(ROLES.ADMIN.toLowerCase());

  if (isAdmin && location.pathname === "/dashboard") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // org_admin routes require the user to have an org ID in their token
  const isOrgAdminRoute = allowedRoles?.some(
    (r) => r.toLowerCase() === ROLES.ORG_ADMIN.toLowerCase(),
  );
  
  if (isOrgAdminRoute && userRoles.includes(ROLES.ORG_ADMIN.toLowerCase())) {
    if (!effectiveUser?.organization) {
      console.log("ProtectedRoute: No organization found for org_admin user", {
        user: effectiveUser,
        isOffline: !navigator.onLine
      });
      // Don't block offline users — they may have org in cached token
      if (navigator.onLine) {
        return <NoOrganizationMessage />;
      }
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
