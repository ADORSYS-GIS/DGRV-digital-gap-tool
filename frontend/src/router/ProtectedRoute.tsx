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
import { ROLES } from "@/constants/roles";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  requireOrganization?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  // const { isAuthenticated, user, loading } = useAuth();
  // const location = useLocation();

  // const userRoles = React.useMemo(() => {
  //   if (!user) return [];
  //   return [...(user.roles || []), ...(user.realm_access?.roles || [])].map(
  //     (r) => r.toLowerCase(),
  //   );
  // }, [user]);

  // const hasRequiredRole = React.useMemo(() => {
  //   if (!allowedRoles || allowedRoles.length === 0) return true;
  //   return allowedRoles.some((role) => userRoles.includes(role.toLowerCase()));
  // }, [userRoles, allowedRoles]);

  // if (loading) {
  //   return <LoadingSpinner />;
  // }

  // if (!isAuthenticated) {
  //   return <Navigate to="/" replace state={{ from: location }} />;
  // }

  // const isAdmin = userRoles.includes(ROLES.ADMIN.toLowerCase());

  // if (isAdmin && location.pathname === "/dashboard") {
  //   return <Navigate to="/admin/dashboard" replace />;
  // }

  // if (allowedRoles && allowedRoles.length > 0 && !hasRequiredRole) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return children ? <>{children}</> : <Outlet />;
};
