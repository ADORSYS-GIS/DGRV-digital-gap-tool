/**
 * Admin dashboard page that provides administrative controls and system overview.
 * This page provides:
 * - Administrative management tools
 * - System status overview
 * - Recent activity tracking
 * - Organization and user management capabilities
 */
import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import { useAllSubmissions } from "@/hooks/submissions/useAllSubmissions";
import { useAllOrganizationMembers } from "@/hooks/users/useAllOrganizationMembers";
import { AssessmentSummary } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";
import { Building2, FileText, History, Settings, Users } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    data: submissionsData = [],
    isLoading,
    error,
  } = useAllSubmissions({
    enabled: true,
  });

  const submissions: AssessmentSummary[] = submissionsData.map((s) => ({
    ...s,
    id: s.assessment.assessment_id,
    syncStatus: SyncStatus.SYNCED,
    assessment: {
      ...s.assessment,
      started_at: s.assessment.started_at || null,
      completed_at: s.assessment.completed_at || null,
      dimensions_id: s.assessment.dimensions_id as string[],
    },
    overall_score: s.overall_score ?? null,
  }));
  const { data: dimensions } = useDimensions('all');
  const { data: organizations } = useOrganizations();
  const { data: allMembers } = useAllOrganizationMembers();

  // Log for debugging
  // Log for debugging
  console.log("Submissions:", submissions);

  const activeUsers =
    allMembers?.filter((member) => member.enabled).length || 0;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10">
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            {t("adminDashboard.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("adminDashboard.welcomePrefix", { name: "" })}
            <span className="font-semibold text-primary">
              {user?.name || user?.preferred_username || t("adminDashboard.defaultAdmin")}
            </span>
            {t("adminDashboard.welcomeSuffix")}
          </p>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("adminDashboard.stats.orgs.title")}
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {organizations ? organizations.length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("adminDashboard.stats.orgs.desc")}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("adminDashboard.stats.users.title")}
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {activeUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("adminDashboard.stats.users.desc")}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("adminDashboard.stats.assessments.title")}
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {submissions ? submissions.length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("adminDashboard.stats.assessments.desc")}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("adminDashboard.stats.dimensions.title")}
            </CardTitle>
            <Settings className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {dimensions ? dimensions.length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("adminDashboard.stats.dimensions.desc")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tools */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            {t("adminDashboard.tools.title")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/organizations">
            <DashboardCard
              title={t("adminDashboard.tools.orgs.title")}
              description={t("adminDashboard.tools.orgs.desc")}
              icon={Building2}
              variant="default"
            />
          </Link>
          <Link to="/admin/manage-users">
            <DashboardCard
              title={t("adminDashboard.tools.users.title")}
              description={t("adminDashboard.tools.users.desc")}
              icon={Users}
              variant="default"
            />
          </Link>
          <Link to="/admin/dimensions">
            <DashboardCard
              title={t("adminDashboard.tools.dimensions.title")}
              description={t("adminDashboard.tools.dimensions.desc")}
              icon={Settings}
              variant="default"
            />
          </Link>
          <Link to="/admin/digital-gaps">
            <DashboardCard
              title={t("adminDashboard.tools.gaps.title")}
              description={t("adminDashboard.tools.gaps.desc")}
              icon={Settings}
              variant="default"
            />
          </Link>
          <Link to="/admin/recommendations">
            <DashboardCard
              title={t("adminDashboard.tools.recommendations.title")}
              description={t("adminDashboard.tools.recommendations.desc")}
              icon={FileText}
              variant="default"
            />
          </Link>
          <Link to="/admin/action-plans">
            <DashboardCard
              title={t("adminDashboard.tools.actionPlans.title")}
              description={t("adminDashboard.tools.actionPlans.desc")}
              icon={Settings}
              variant="default"
            />
          </Link>
          <Link to="/admin/reports">
            <DashboardCard
              title={t("adminDashboard.tools.reports.title")}
              description={t("adminDashboard.tools.reports.desc")}
              icon={FileText}
              variant="default"
            />
          </Link>
          <Link to="/admin/consolidated-report">
            <DashboardCard
              title={t("adminDashboard.tools.consolidated.title")}
              description={t("adminDashboard.tools.consolidated.desc")}
              icon={FileText}
              variant="default"
            />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center text-lg font-semibold">
              <History className="mr-2 h-5 w-5 text-muted-foreground" />
              {t("adminDashboard.recent.title")}
            </CardTitle>
            <CardDescription>
              {t("adminDashboard.recent.desc")}
            </CardDescription>
          </div>
          <Link to="/admin/reports">
            <Button variant="outline" size="sm" className="h-8">
              {t("adminDashboard.recent.viewAll")}
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading && <LoadingSpinner />}
          {error && (
            <p className="text-red-500">{t("adminDashboard.recent.error", { message: error.message })}</p>
          )}
          {submissions && (
            <SubmissionList
              submissions={submissions}
              limit={3}
              basePath="admin"
              onSubmissionSelect={(submissionId) => {
                const selectedSubmission = submissions.find(
                  (s) => s.id === submissionId,
                );
                if (selectedSubmission?.assessment.organization_id) {
                  navigate(
                    `/admin/reports/${selectedSubmission.assessment.organization_id}/${submissionId}/export`,
                  );
                } else {
                  console.error(
                    "Organization ID not found for selected submission.",
                  );
                }
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
