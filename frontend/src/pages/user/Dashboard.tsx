/**
 * User dashboard page that displays assessment information and user statistics.
 * This page provides:
 * - Welcome message with user name
 * - Quick statistics overview
 * - Assessment management section
 * - Placeholder for additional content
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
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import {
  ClipboardCheck,
  ClipboardList,
  FilePlus2,
  History,
  Download,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { ReportActions } from "@/components/shared/reports/ReportActions";
import SubmissionChart from "@/components/shared/submissions/SubmissionChart";
import { AssessmentSummary } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const cooperationId = useCooperationId();
  const {
    data: submissionsData,
    isLoading,
    error,
  } = useSubmissionsByCooperation(cooperationId || "");

  const submissions: AssessmentSummary[] =
    submissionsData?.map((s) => ({
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
    })) || [];

  const latestSubmission = submissionsData?.[0];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          User Management Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.name || user?.preferred_username || "User"}.
          Manage cooperatives and their assessments.
        </p>
      </div>

      {/* Management Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/user/assessments">
          <DashboardCard
            title="Start Assessment"
            description="Begin a new assessment"
            icon={FilePlus2}
            variant="default"
          />
        </Link>
        <Link to="/user/action-plans">
          <DashboardCard
            title="View Action Plan"
            description="Review and monitor strategic action plans"
            icon={ClipboardList}
            variant="default"
          />
        </Link>
        <Link to="/user/submissions">
          <DashboardCard
            title="View Submissions"
            description="Track and evaluate assessment submissions"
            icon={ClipboardCheck}
            variant="default"
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

      {/* Latest Submission Chart */}
      {latestSubmission && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionChart submission={latestSubmission} />
          </CardContent>
        </Card>
      )}

      {/* Recent Submissions */}
      <Card>
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
          <Link to="/user/submissions">
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
              limit={3}
              basePath="/user"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
