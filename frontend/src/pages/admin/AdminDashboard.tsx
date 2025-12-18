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

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10">
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome back,{" "}
            <span className="font-semibold text-primary">
              {user?.name || user?.preferred_username || "Administrator"}
            </span>
            . Manage the digital gap assessment platform and monitor system
            performance.
          </p>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Organizations
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {organizations ? organizations.length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered organizations
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {activeUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all organizations
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assessments Taken
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {submissions ? submissions.length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total submissions
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Dimensions
            </CardTitle>
            <Settings className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {dimensions ? dimensions.length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active assessment dimensions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tools */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Management Tools
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/organizations">
            <DashboardCard
              title="Manage Organizations"
              description="Create, edit, and manage organizations"
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
              title="Manage Dimensions"
              description="Create, edit, and manage dimensions"
              icon={Settings}
              variant="default"
            />
          </Link>
          <Link to="/admin/digital-gaps">
            <DashboardCard
              title="Manage Digital Gaps"
              description="Create, edit, and manage digital gaps"
              icon={Settings}
              variant="default"
            />
          </Link>
          <Link to="/admin/recommendations">
            <DashboardCard
              title="Manage Recommendations"
              description="Create, edit, and manage recommendations"
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
          <Link to="/admin/reports">
            <DashboardCard
              title="View Reports"
              description="View reports by organization and submission"
              icon={FileText}
              variant="default"
            />
          </Link>
          <Link to="/admin/consolidated-report">
            <DashboardCard
              title="Consolidated Report"
              description="View consolidated report for all organizations"
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
              Recent Submissions
            </CardTitle>
            <CardDescription>
              A log of recent activities and system events.
            </CardDescription>
          </div>
          <Link to="/admin/reports">
            <Button variant="outline" size="sm" className="h-8">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading && <LoadingSpinner />}
          {error && (
            <p className="text-red-500">An error occurred: {error.message}</p>
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
