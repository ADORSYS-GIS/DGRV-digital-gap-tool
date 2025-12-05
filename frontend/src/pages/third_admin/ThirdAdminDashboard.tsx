/**
 * Third Admin dashboard page for managing specific administrative tasks.
 * This page provides:
 * - User management access
 * - Assessment answering interface
 * - Action plan viewing
 * - Submission tracking
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
  Users,
  FilePenLine,
  ClipboardList,
  Inbox,
  History,
  Download,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { ReportActions } from "@/components/shared/reports/ReportActions";
import { AssessmentSummary } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";

const ThirdAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const cooperationId = useCooperationId();
  const {
    data: submissionsData,
    isLoading,
    error,
  } = useSubmissionsByCooperation(cooperationId || "", {
    enabled: !!cooperationId,
  });

  const submissions: AssessmentSummary[] = (
    Array.isArray(submissionsData) ? submissionsData : submissionsData ? [submissionsData] : []
  ).map((s) => ({
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

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Third Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Welcome back,{" "}
          {user?.name || user?.preferred_username || "Administrator"}. Here are
          your tools to manage assessments and users.
        </p>
      </div>

      {/* Management Tools Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/third-admin/manage-cooperation-users" className="flex">
          <DashboardCard
            title="Manage Users"
            description="Administer user accounts and permissions"
            icon={Users}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/third-admin/assessments" className="flex">
          <DashboardCard
            title="Answer Assesment"
            description="Fill out and manage assessments"
            icon={FilePenLine}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/third-admin/action-plans" className="flex">
          <DashboardCard
            title="View Action Plan"
            description="Review and track action plans"
            icon={ClipboardList}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/third-admin/submissions" className="flex">
          <DashboardCard
            title="View Submissions"
            description="Browse and manage all submissions"
            icon={Inbox}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
      </div>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Export Reports
          </CardTitle>
          <CardDescription>
            Generate and download assessment reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportActions />
        </CardContent>
      </Card>

      {/* Recent History */}
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Recent Submissions
            </CardTitle>
            <CardDescription>
              A log of recent activities and system events.
            </CardDescription>
          </div>
          <Link to="/third-admin/submissions">
            <Button variant="outline">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading && <LoadingSpinner />}
          {error && (
            <p className="text-red-500">An error occurred: {error.message}</p>
          )}
          {submissions && (
            <SubmissionList
              submissions={submissions}
              limit={5}
              basePath="third-admin"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThirdAdminDashboard;
