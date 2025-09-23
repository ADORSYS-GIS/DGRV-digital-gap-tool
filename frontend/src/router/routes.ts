/**
 * Application route configuration that defines all routes and their protection levels.
 * This file centralizes the routing structure, making it easy to manage:
 * - Public routes accessible to all users
 * - Protected routes with role-based access control
 * - Admin routes requiring specific permissions
 * - Error routes for handling 404s and unauthorized access
 */
import { ROLES } from "@/constants/roles";
import * as React from "react";
import { HomePage } from "../pages/HomePage";
import OnboardingFlow from "../pages/OnboardingFlow";
import NotFound from "../pages/NotFound";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Dashboard from "../pages/user/Dashboard";
import { ProtectedRoute } from "./ProtectedRoute";

const routes = [
  { path: "/", element: React.createElement(HomePage) },
  {
    path: "/unauthorized",
    element: React.createElement(() =>
      React.createElement("div", null, "Unauthorized"),
    ),
  },
  {
    path: "/onboarding",
    element: React.createElement(ProtectedRoute, {
      allowedRoles: [ROLES.ADMIN, ROLES.Org_User],
    }),
    children: [{ path: "", element: React.createElement(OnboardingFlow) }],
  },
  {
    path: "/admin",
    element: React.createElement(ProtectedRoute, {
      allowedRoles: [ROLES.ADMIN],
    }),
    children: [
      { path: "dashboard", element: React.createElement(AdminDashboard) },
    ],
  },
  {
    path: "/dashboard",
    element: React.createElement(ProtectedRoute, {
      allowedRoles: [ROLES.Org_User],
    }),
    children: [{ path: "", element: React.createElement(Dashboard) }],
  },
  { path: "*", element: React.createElement(NotFound) },
];

export default routes;
