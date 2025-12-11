/**
 * Second admin dashboard page for cooperative management.
 * This page provides:
 * - Cooperative and user management tools
 * - Assessment creation and submission tracking
 * - Action plan overview
 */
import { DashboardCard } from "@/components/shared/DashboardCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
  Building2,
  Users,
  FilePlus2,
  ClipboardList,
  ClipboardCheck,
  History,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useTranslation } from "react-i18next";

const SecondAdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const organizationId = useOrganizationId();
  const {
    data: submissions = [],
    isLoading,
    error,
  } = useSubmissionsByOrganization(organizationId || "", {
    enabled: !!organizationId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Log for debugging
  console.log("Organization ID:", organizationId);
  console.log("Submissions:", submissions);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("secondAdminDashboard.title")}
        </h1>
        <p className="text-gray-600">
          {t("secondAdminDashboard.welcomeMessage")}{" "}
          {user?.name || user?.preferred_username || t("secondAdminDashboard.administrator")}.{" "}
          {t("secondAdminDashboard.manageCoopAssessments")}
        </p>
      </div>

      {/* Management Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/second-admin/cooperations">
          <DashboardCard
            title={t("secondAdminDashboard.manageCooperationsTitle")}
            description={t("secondAdminDashboard.manageCooperationsDescription")}
            icon={Building2}
            variant="default"
          />
        </Link>
        <Link to="/second-admin/manage-cooperation-users">
          <DashboardCard
            title={t("secondAdminDashboard.manageUsersTitle")}
            description={t("secondAdminDashboard.manageUsersDescription")}
            icon={Users}
            variant="default"
          />
        </Link>
        <Link to="/second-admin/assessments">
          <DashboardCard
            title={t("secondAdminDashboard.createAssessmentTitle")}
            description={t("secondAdminDashboard.createAssessmentDescription")}
            icon={FilePlus2}
            variant="default"
          />
        </Link>
        <Link to="/second-admin/action-plans">
          <DashboardCard
            title={t("secondAdminDashboard.viewActionPlanTitle")}
            description={t("secondAdminDashboard.viewActionPlanDescription")}
            icon={ClipboardList}
            variant="default"
          />
        </Link>
        <Link to="/second-admin/submissions">
          <DashboardCard
            title={t("secondAdminDashboard.viewSubmissionsTitle")}
            description={t("secondAdminDashboard.viewSubmissionsDescription")}
            icon={ClipboardCheck}
            variant="default"
          />
        </Link>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              {t("secondAdminDashboard.recentSubmissionsTitle")}
            </CardTitle>
            <CardDescription>
              {t("secondAdminDashboard.recentSubmissionsDescription")}
            </CardDescription>
          </div>
          <Link to="/second-admin/submissions">
            <Button variant="outline">{t("secondAdminDashboard.viewAll")}</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading && <LoadingSpinner />}
          {error && (
            <p className="text-red-500">{t("secondAdminDashboard.errorMessage", { message: error.message })}</p>
          )}
          {submissions && (
            <SubmissionList
              submissions={submissions}
              limit={5}
              basePath="/second-admin"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecondAdminDashboard;
