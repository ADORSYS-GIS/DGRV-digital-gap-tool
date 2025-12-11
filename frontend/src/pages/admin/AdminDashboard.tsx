/**
 * Admin dashboard page that provides administrative controls and system overview.
 * This page provides:
 * - Administrative management tools
 * - System status overview
 * - Recent activity tracking
 * - Organization and user management capabilities
 */
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Building2, FileText, History, Settings, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import { useAllOrganizationMembers } from "@/hooks/users/useAllOrganizationMembers";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { useTranslation } from "react-i18next";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
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
  const { data: dimensions } = useDimensions();
  const { data: assessments } = useAssessments();
  const { data: organizations } = useOrganizations();
  const { data: allMembers } = useAllOrganizationMembers();

  // Log for debugging
  console.log("Organization ID:", organizationId);
  console.log("Submissions:", submissions);

  const activeUsers =
    allMembers?.filter((member) => member.enabled === true).length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("adminDashboard.title")}
        </h1>
        <p className="text-gray-600">
          {t("adminDashboard.welcomeMessage", {
            name: user?.name || user?.preferred_username || t("adminDashboard.administrator"),
          })}{" "}
          {t("adminDashboard.managePlatform")}
        </p>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("adminDashboard.totalOrganizations")}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations ? organizations.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminDashboard.fromLastMonth", { percentage: "0%" })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("adminDashboard.activeUsers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {t("adminDashboard.fromLastMonth", { percentage: "0%" })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("adminDashboard.assessmentsTaken")}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessments ? assessments.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminDashboard.fromLastMonth", { percentage: "0%" })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("adminDashboard.totalDimensions")}
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dimensions ? dimensions.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminDashboard.fromLastMonth", { percentage: "0%" })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tools */}
      <Card>
        <CardHeader>
          <CardTitle>{t("adminDashboard.managementTools.title")}</CardTitle>
          <CardDescription>
            {t("adminDashboard.managementTools.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/organizations">
            <DashboardCard
              title={t("adminDashboard.manageOrganizations.title")}
              description={t("adminDashboard.manageOrganizations.description")}
              icon={Building2}
              variant="default"
            />
          </Link>
          <Link to="/admin/dimensions">
            <DashboardCard
              title={t("adminDashboard.manageDimensions.title")}
              description={t("adminDashboard.manageDimensions.description")}
              icon={Settings}
              variant="default"
            />
          </Link>
          <Link to="/admin/action-plan">
            <DashboardCard
              title={t("adminDashboard.manageActionPlan.title")}
              description={t("adminDashboard.manageActionPlan.description")}
              icon={Settings}
              variant="default"
            />
          </Link>
          <Link to="/admin/digital-gaps">
            <DashboardCard
              title={t("adminDashboard.manageDigitalGaps.title")}
              description={t("adminDashboard.manageDigitalGaps.description")}
              icon={Settings}
              variant="default"
            />
          </Link>
          <Link to="/admin/manage-users">
            <DashboardCard
              title={t("adminDashboard.manageUsers.title")}
              description={t("adminDashboard.manageUsers.description")}
              icon={Users}
              variant="default"
            />
          </Link>
          <Link to="/admin/recommendations">
            <DashboardCard
              title={t("adminDashboard.manageRecommendations.title")}
              description={t("adminDashboard.manageRecommendations.description")}
              icon={FileText}
              variant="default"
            />
          </Link>
          {/* <Link to="/admin/reports">
            <DashboardCard
              title={t("adminDashboard.viewReports.title")}
              description={t("adminDashboard.viewReports.description")}
              icon={FileText}
              variant="default"
            />
          </Link> */}
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              {t("adminDashboard.recentSubmissions.title")}
            </CardTitle>
            <CardDescription>
              {t("adminDashboard.recentSubmissions.description")}
            </CardDescription>
          </div>
          <Link to="/second-admin/submissions">
            <Button variant="outline">{t("adminDashboard.viewAll")}</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading && <LoadingSpinner />}
          {error && (
            <p className="text-red-500">
              {t("adminDashboard.errorMessage", { message: error.message })}
            </p>
          )}
          {submissions && (
            <SubmissionList
              submissions={submissions}
              limit={5}
              basePath="admin"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
