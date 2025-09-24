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
import { useAuth } from "../hooks/shared/useAuth";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import React from "react";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  requireOrganization?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  const hasRequiredRole = React.useMemo(() => {
    console.log("Checking roles. User object:", user);
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!user) return false;

    const allRoles = [
      ...(user.roles || []),
      ...(user.realm_access?.roles || []),
    ].map((r) => r.toLowerCase());

    console.log("User Roles:", allRoles, "Allowed Roles:", allowedRoles);

    return allowedRoles.some((role) => allRoles.includes(role.toLowerCase()));
  }, [user, allowedRoles]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
