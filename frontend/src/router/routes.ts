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
import SecondAdminLayout from "@/layouts/SecondAdminLayout";
import ThirdAdminLayout from "@/layouts/ThirdAdminLayout";
import UserLayout from "@/layouts/UserLayout";
const UserAnswerAssessment = React.lazy(
  () => import("../pages/user/AnswerAssessment.tsx"),
);
const UserViewActionPlan = React.lazy(
  () => import("../pages/user/ViewActionPlan.tsx"),
);
const UserViewSubmissions = React.lazy(
  () => import("../pages/user/ViewSubmissions.tsx"),
);
const ManageOrganizations = React.lazy(
  () => import("../pages/admin/ManageOrganizationsPage"),
);
const AdminDashboard = React.lazy(
  () => import("../pages/admin/AdminDashboard"),
);
const ManageDigitalisationGap = React.lazy(
  () => import("../pages/admin/ManageDigitalisationGap"),
);
const ManageDimensions = React.lazy(
  () => import("../pages/admin/ManageDimensions"),
);
const ManageActionPlan = React.lazy(
  () => import("../pages/admin/ManageActionPlan"),
);
const ManageDigitalisationLevels = React.lazy(
  () => import("../pages/admin/ManageDigitalisationLevelsPage"),
);
const SecondAdminDashboard = React.lazy(
  () => import("../pages/second_admin/SecondAdminDashboard"),
);
const ManageCooperations = React.lazy(
  () => import("../pages/second_admin/ManageCooperations.tsx"),
);
const SecondAdminManageUsers = React.lazy(
  () => import("../pages/second_admin/ManageUsers.tsx"),
);
const SecondAdminCreateAssessment = React.lazy(
  () => import("../pages/second_admin/CreateAssessment.tsx"),
);
const SecondAdminViewActionPlan = React.lazy(
  () => import("../pages/second_admin/ViewActionPlan.tsx"),
);
const ActionPlan = React.lazy(
  () => import("../pages/second_admin/ActionPlan.tsx"),
);
const SecondAdminViewSubmissions = React.lazy(
  () => import("../pages/second_admin/ViewSubmissions.tsx"),
);
const SubmissionDetailPage = React.lazy(
  () => import("../pages/second_admin/SubmissionDetailPage.tsx"),
);
const SecondAdminAnswerAssessment = React.lazy(
  () => import("../pages/second_admin/AnswerAssessment.tsx"),
);
const SecondAdminAnswerDimension = React.lazy(
  () => import("../pages/second_admin/AnswerDimension.tsx"),
);
const ThirdAdminDashboard = React.lazy(
  () => import("../pages/third_admin/ThirdAdminDashboard"),
);
const ManageUsers = React.lazy(
  () => import("../pages/third_admin/ManageUsers"),
);
const AnswerAssessment = React.lazy(
  () => import("../pages/third_admin/AnswerAssessment"),
);
const ViewActionPlan = React.lazy(
  () => import("../pages/third_admin/ViewActionPlan"),
);
const ViewSubmissions = React.lazy(
  () => import("../pages/third_admin/ViewSubmissions"),
);

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
      allowedRoles: [
        ROLES.ADMIN,
        ROLES.ORG_ADMIN,
        ROLES.COOP_ADMIN,
        ROLES.Org_User,
      ],
      children: React.createElement(OnboardingFlow),
    }),
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
        path: "digitalisation-gap",
        element: React.createElement(ManageDigitalisationGap),
      },
      { path: "dimensions", element: React.createElement(ManageDimensions) },
      {
        path: "action-plan",
        element: React.createElement(ManageActionPlan),
      },
      {
        path: "manage-gap/:dimensionId",
        element: React.createElement(ManageDigitalisationGap),
      },
      {
        path: "dimensions/:dimensionId/levels",
        element: React.createElement(ManageDigitalisationLevels),
      },
    ],
  },
  {
    path: "/second-admin",
    element: React.createElement(ProtectedRoute, {
      allowedRoles: [ROLES.ORG_ADMIN],
      children: React.createElement(SecondAdminLayout),
    }),
    children: [
      {
        path: "dashboard",
        element: React.createElement(SecondAdminDashboard),
      },
      {
        path: "cooperations",
        element: React.createElement(ManageCooperations),
      },
      {
        path: "users",
        element: React.createElement(SecondAdminManageUsers),
      },
      {
        path: "create-assessment",
        element: React.createElement(SecondAdminCreateAssessment),
      },
      {
        path: "action-plan",
        element: React.createElement(ActionPlan),
      },
      {
        path: "action-plan/:assessmentId",
        element: React.createElement(SecondAdminViewActionPlan),
      },
      {
        path: "submissions",
        element: React.createElement(SecondAdminViewSubmissions),
      },
      {
        path: "submissions/:submissionId",
        element: React.createElement(SubmissionDetailPage),
      },
      {
        path: "answer-assessment",
        element: React.createElement(SecondAdminAnswerAssessment),
      },
      {
        path: "answer-assessment/:dimensionId",
        element: React.createElement(SecondAdminAnswerDimension),
      },
    ],
  },
  {
    path: "/third-admin",
    element: React.createElement(ProtectedRoute, {
      allowedRoles: [ROLES.COOP_ADMIN],
      children: React.createElement(ThirdAdminLayout),
    }),
    children: [
      { path: "dashboard", element: React.createElement(ThirdAdminDashboard) },
      { path: "users", element: React.createElement(ManageUsers) },
      {
        path: "answer-assessment",
        element: React.createElement(AnswerAssessment),
      },
      { path: "action-plan", element: React.createElement(ViewActionPlan) },
      { path: "submissions", element: React.createElement(ViewSubmissions) },
    ],
  },
  {
    path: "/dashboard",
    element: React.createElement(ProtectedRoute, {
      allowedRoles: [ROLES.Org_User],
      children: React.createElement(UserLayout),
    }),
    children: [
      { path: "", element: React.createElement(Dashboard) },
      { path: "answer-assessment", element: React.createElement(UserAnswerAssessment) },
      { path: "action-plan", element: React.createElement(UserViewActionPlan) },
      { path: "submissions", element: React.createElement(UserViewSubmissions) },
    ],
  },
  { path: "*", element: React.createElement(NotFound) },
];

export default routes;
