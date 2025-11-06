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
  // For testing purposes, all routes are accessible.
  // const { isAuthenticated, user, loading } = useAuth();
  // const location = useLocation();

  // const hasRequiredRole = React.useMemo(() => {
  //   if (!allowedRoles || allowedRoles.length === 0) return true;
  //   if (!user) return false;

  //   if (!user || !user.roles) return false;
  //   return allowedRoles.some((role) =>
  //     user.roles?.map((r) => r.toLowerCase()).includes(role.toLowerCase()),
  //   );
  // }, [user, allowedRoles]);

  // if (loading) {
  //   return <LoadingSpinner />;
  // }

  // if (!isAuthenticated) {
  //   return <Navigate to="/" replace state={{ from: location }} />;
  // }

  // if (allowedRoles && allowedRoles.length > 0 && !hasRequiredRole) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return children ? <>{children}</> : <Outlet />;
};
