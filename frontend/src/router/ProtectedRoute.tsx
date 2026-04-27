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
import { authService } from "@/services/shared/authService";
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
  // Track whether we have cached tokens in IndexedDB (for offline use)
  const [hasCachedTokens, setHasCachedTokens] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    get("auth_tokens").then((tokens: any) => {
      setHasCachedTokens(!!(tokens?.accessToken));
    }).catch(() => setHasCachedTokens(false));
  }, []);

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

  // Still resolving auth state or checking cached tokens — show spinner, never redirect
  if (loading || hasCachedTokens === null) {
    return <LoadingSpinner />;
  }

  // Not authenticated AND no cached tokens → only then redirect to home
  // If we have cached tokens but isAuthenticated is still false (e.g. Keycloak
  // server unreachable), we wait — main.tsx will resolve this via the offline
  // fallback path and call onReady(true), which updates AuthContext.
  if (!isAuthenticated && !hasCachedTokens) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Have cached tokens but auth hasn't resolved yet (offline Keycloak init in progress)
  if (!isAuthenticated && hasCachedTokens) {
    return <LoadingSpinner />;
  }

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
  
  // org_admin routes require the user to have an org ID in their token
  const isOrgAdminRoute = allowedRoles?.some(
    (r) => r.toLowerCase() === ROLES.ORG_ADMIN.toLowerCase(),
  );
  
  if (isOrgAdminRoute && userRoles.includes(ROLES.ORG_ADMIN.toLowerCase())) {
    // Simply check if user has organization in their profile
    // The AuthContext should have populated this from the token
    if (!user?.organization) {
      console.log("ProtectedRoute: No organization found for org_admin user", {
        user: user,
        isOffline: !navigator.onLine
      });
      return <NoOrganizationMessage />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
