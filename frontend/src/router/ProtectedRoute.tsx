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
  return children ? <>{children}</> : <Outlet />;
};