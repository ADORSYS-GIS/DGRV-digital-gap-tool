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
import Dashboard from "../pages/user/Dashboard";
import { ProtectedRoute } from "./ProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";
const ManageOrganizations = React.lazy(
  () => import("../pages/admin/ManageOrganizationsPage"),
);
const AdminDashboard = React.lazy(
  () => import("../pages/admin/AdminDashboard"),
);
const ManageDigitalisationLevels = React.lazy(
  () => import("../pages/admin/ManageDigitalisationLevels"),
);
const ManageDimensions = React.lazy(
  () => import("../pages/admin/ManageDimensions"),
);
const ManageActionPlan = React.lazy(
  () => import("../pages/admin/ManageActionPlan"),
);
const ManageDigitalGaps = React.lazy(
  () => import("../pages/admin/ManageDigitalGaps"),
);
const ManageUsers = React.lazy(() => import("../pages/admin/ManageUsers"));
const ViewReports = React.lazy(() => import("../pages/admin/ViewReports"));

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
      children: React.createElement(AdminLayout),
    }),
    children: [
      { path: "dashboard", element: React.createElement(AdminDashboard) },
      {
        path: "organizations",
        element: React.createElement(ManageOrganizations),
      },
      {
        path: "digitalisation-levels",
        element: React.createElement(ManageDigitalisationLevels),
      },
      { path: "dimensions", element: React.createElement(ManageDimensions) },
      {
        path: "action-plan",
        element: React.createElement(ManageActionPlan),
      },
      {
        path: "digital-gaps",
        element: React.createElement(ManageDigitalGaps),
      },
      {
        path: "manage-levels/:dimensionId",
        element: React.createElement(ManageDigitalisationLevels),
      },
      {
        path: "users",
        element: React.createElement(ManageUsers),
      },
      {
        path: "reports",
        element: React.createElement(ViewReports),
      },
    ],
  },
  {
    path: "/dashboard",
    element: React.createElement(ProtectedRoute, {
      allowedRoles: [ROLES.ADMIN, ROLES.Org_User],
    }),
    children: [{ path: "", element: React.createElement(Dashboard) }],
  },
  { path: "*", element: React.createElement(NotFound) },
];

export default routes;
