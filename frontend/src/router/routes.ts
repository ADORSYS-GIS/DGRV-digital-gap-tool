/**
 * Application route configuration that defines all routes and their protection levels.
 * This file centralizes the routing structure, making it easy to manage:
 * - Public routes accessible to all users
 * - Protected routes with role-based access control
 * - Admin routes requiring specific permissions
 * - Error routes for handling 404s and unauthorized access
 */
import { ROLES } from "@/constants/roles";
import { AdminLayout } from "@/layouts/AdminLayout";
import { SecondAdminLayout } from "@/layouts/SecondAdminLayout";
import ThirdAdminLayout from "@/layouts/ThirdAdminLayout";
import UserLayout from "@/layouts/UserLayout";
import AnswerDimensionAssessmentPage from "@/pages/assessments/AnswerDimensionAssessmentPage";
import * as React from "react";
import { HomePage } from "../pages/HomePage";
import NotFound from "../pages/NotFound";
import OnboardingFlow from "../pages/OnboardingFlow";
import Dashboard from "../pages/user/Dashboard";
import { ProtectedRoute } from "./ProtectedRoute";
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
const ManageRecommendations = React.lazy(
  () => import("../pages/admin/ManageRecommendations"),
);
const ManageActionPlan = React.lazy(
  () => import("../pages/admin/ManageActionPlan"),
);
const ActionPlansPage = React.lazy(
  () => import("../pages/admin/ActionPlansPage"),
);
const ManageDigitalGaps = React.lazy(
  () => import("../pages/admin/ManageDigitalGaps"),
);
const ViewReports = React.lazy(() => import("../pages/admin/ViewReports"));
const OrganizationReportsPage = React.lazy(
  () => import("../pages/admin/OrganizationReportsPage"),
);
const ExportReportPage = React.lazy(
  () => import("../pages/admin/ExportReportPage"),
);
const ConsolidatedReportPage = React.lazy(
  () => import("../pages/admin/ConsolidatedReportPage"),
);
const SecondAdminDashboard = React.lazy(
  () => import("../pages/second_admin/SecondAdminDashboard"),
);
const OrgAdminConsolidatedReportPage = React.lazy(
  () => import("../pages/second_admin/ConsolidatedReportPage"),
);
const ManageCooperations = React.lazy(
  () => import("../pages/second_admin/ManageCooperations"),
);
const ManageAssessments = React.lazy(
  () => import("../pages/shared/assessments/ManageAssessments"),
);
const AssessmentDetailPage = React.lazy(
  () => import("../pages/shared/assessments/AssessmentDetailPage"),
);
const ManageSubmissionsPage = React.lazy(
  () => import("../pages/shared/submissions/ManageSubmissionsPage"),
);
const SubmissionDetailPage = React.lazy(
  () => import("../pages/shared/submissions/SubmissionDetailPage"),
);
const ActionPlansListPage = React.lazy(
  () => import("../pages/shared/action_plans/ActionPlansListPage"),
);
const ActionPlanPage = React.lazy(
  () => import("../pages/shared/action_plans/ActionPlanPage"),
);
const ThirdAdminDashboard = React.lazy(
  () => import("../pages/third_admin/ThirdAdminDashboard"),
);
const ManageUsers = React.lazy(() => import("../pages/shared/ManageUsers"));
const OrganizationUsers = React.lazy(
  () => import("../pages/shared/OrganizationUsers"),
);
const ManageCooperationUsers = React.lazy(
  () => import("../pages/second_admin/ManageCooperationUsers"),
);
const ManageCooperationUsersPage = React.lazy(
  () => import("../pages/second_admin/ManageCooperationUsersPage"),
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
        ROLES.COOP_USER,
      ],
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
        path: "recommendations",
        element: React.createElement(ManageRecommendations),
      },
      {
        path: "action-plans",
        element: React.createElement(ActionPlansPage),
      },
      {
        path: "action-plans/:assessmentId",
        element: React.createElement(ActionPlanPage),
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
        path: "manage-users",
        element: React.createElement(ManageUsers),
      },
      {
        path: "manage-users/:orgId",
        element: React.createElement(OrganizationUsers),
      },
      {
        path: "reports",
        element: React.createElement(ViewReports),
      },
      {
        path: "reports/:organizationId",
        element: React.createElement(OrganizationReportsPage),
      },
      {
        path: "reports/:organizationId/:submissionId/export",
        element: React.createElement(ExportReportPage),
      },
      {
        path: "consolidated-report",
        element: React.createElement(ConsolidatedReportPage),
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
        path: "assessments",
        element: React.createElement(ManageAssessments),
      },
      {
        path: "assessment/:assessmentId",
        element: React.createElement(AssessmentDetailPage),
      },
      {
        path: "assessment/:assessmentId/dimension/:dimensionId",
        element: React.createElement(AnswerDimensionAssessmentPage),
      },
      {
        path: "submissions",
        element: React.createElement(ManageSubmissionsPage),
      },
      {
        path: "submissions/:submissionId",
        element: React.createElement(SubmissionDetailPage),
      },
      {
        path: "reports",
        element: React.createElement(ManageSubmissionsPage),
      },
      {
        path: "action-plans",
        element: React.createElement(ActionPlansListPage),
      },
      {
        path: "action-plans/:assessmentId",
        element: React.createElement(ActionPlanPage),
      },
      {
        path: "manage-cooperation-users",
        element: React.createElement(ManageCooperationUsers),
      },
      {
        path: "manage-cooperation-users/:cooperationId",
        element: React.createElement(ManageCooperationUsersPage),
      },
      {
        path: "consolidated-report/:organizationId",
        element: React.createElement(OrgAdminConsolidatedReportPage),
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
      {
        path: "assessments",
        element: React.createElement(ManageAssessments),
      },
      {
        path: "assessment/:assessmentId",
        element: React.createElement(AssessmentDetailPage),
      },
      {
        path: "assessment/:assessmentId/dimension/:dimensionId",
        element: React.createElement(AnswerDimensionAssessmentPage),
      },
      {
        path: "submissions",
        element: React.createElement(ManageSubmissionsPage),
      },
      {
        path: "submissions/:submissionId",
        element: React.createElement(SubmissionDetailPage),
      },
      {
        path: "action-plans",
        element: React.createElement(ActionPlansListPage),
      },
      {
        path: "action-plans/:assessmentId",
        element: React.createElement(ActionPlanPage),
      },
      {
        path: "manage-cooperation-users",
        element: React.createElement(ManageCooperationUsers),
      },
      {
        path: "manage-cooperation-users/:cooperationId",
        element: React.createElement(ManageCooperationUsersPage),
      },
    ],
  },
  {
    path: "/user",
    element: React.createElement(UserLayout),
    children: [
      {
        element: React.createElement(ProtectedRoute, {
          allowedRoles: [ROLES.COOP_USER],
        }),
        children: [
          { path: "dashboard", element: React.createElement(Dashboard) },
          {
            path: "assessments",
            element: React.createElement(ManageAssessments),
          },
          {
            path: "assessment/:assessmentId",
            element: React.createElement(AssessmentDetailPage),
          },
          {
            path: "assessment/:assessmentId/dimension/:dimensionId",
            element: React.createElement(AnswerDimensionAssessmentPage),
          },
          {
            path: "submissions",
            element: React.createElement(ManageSubmissionsPage),
          },
          {
            path: "submissions/:submissionId",
            element: React.createElement(SubmissionDetailPage),
          },
          {
            path: "action-plans",
            element: React.createElement(ActionPlansListPage),
          },
          {
            path: "action-plans/:assessmentId",
            element: React.createElement(ActionPlanPage),
          },
        ],
      },
    ],
  },
  { path: "*", element: React.createElement(NotFound) },
];

export default routes;
