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
import { useTranslation } from "react-i18next";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const organizationId = useOrganizationId();
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
  const { data: dimensions } = useDimensions();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back,{" "}
          {user?.name || user?.preferred_username || "Administrator"}. Manage
          the digital gap assessment platform.
        </p>
      </div>

      {/* System Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Organizations
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {organizations ? organizations.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminDashboard.fromLastMonth", { percentage: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("adminDashboard.activeUsers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assessments Taken
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {submissions ? submissions.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Dimensions
            </CardTitle>
            <Settings className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {dimensions ? dimensions.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
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
          <Link to="/admin/manage-users">
            <DashboardCard
              title="Manage Users"
              description="Create, edit, and manage users"
              icon={Users}
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
          <Link to="/admin/action-plans">
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
              description={t(
                "adminDashboard.manageRecommendations.description",
              )}
              icon={FileText}
              variant="default"
            />
          </Link>
          <Link to="/admin/action-plans">
            <DashboardCard
              title="View Action Plans"
              description="View action plans by organization and submission"
              icon={Settings}
              variant="default"
            />
          </Link>
        </div>
      </div>

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
        <CardContent className="p-6">
          {isLoading && <LoadingSpinner />}
          {error && (
            <p className="text-red-500">
              {t("adminDashboard.errorMessage", {
                message: (error as Error).message,
              })}
            </p>
          )}
          {submissions && (
            <SubmissionList
              submissions={submissions}
              limit={5}
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
