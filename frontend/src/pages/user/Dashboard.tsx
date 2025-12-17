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
import { useCooperationIdFromPath } from "@/hooks/cooperations/useCooperationIdFromPath";
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
  const cooperationIdFromRoute = useCooperationId();
  const {
    cooperationId: cooperationIdFromPath,
    isLoading: isLoadingCoopFromPath,
    error: coopFromPathError,
  } = useCooperationIdFromPath();
  const cooperationId = cooperationIdFromRoute || cooperationIdFromPath || null;

  const {
    data: submissionsData = [],
    isLoading,
    error,
  } = useSubmissionsByCooperation(cooperationId || "", {
    enabled: !!cooperationId,
  });

  const normalizedSubmissions = Array.isArray(submissionsData)
    ? submissionsData
    : submissionsData
      ? [submissionsData]
      : [];

  const submissions: AssessmentSummary[] = normalizedSubmissions.map((s) => ({
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

  const latestSubmission = normalizedSubmissions?.[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <header className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/80">
              User panel
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              User management dashboard
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Welcome back{" "}
            <span className="font-medium text-foreground">
              {user?.name || user?.preferred_username || "User"}
            </span>
            . Use these tools to create assessments, monitor action plans, and
            review submissions for your cooperative.
          </p>
        </header>

        {/* Management Tools Grid */}
        <section aria-label="Primary user actions">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            <Link to="/user/assessments">
              <DashboardCard
                title="Start assessment"
                description="Begin a new organizational assessment."
                icon={FilePlus2}
                variant="default"
              />
            </Link>
            <Link to="/user/action-plans">
              <DashboardCard
                title="View action plan"
                description="Review and monitor strategic action plans."
                icon={ClipboardList}
                variant="default"
              />
            </Link>
            <Link
              to="/user/submissions"
              className="md:col-span-3 lg:col-span-1"
            >
              <DashboardCard
                title="View submissions"
                description="Track and evaluate completed assessments."
                icon={ClipboardCheck}
                variant="default"
              />
            </Link>
          </div>
        </section>

        {/* Reports + Recent activity layout */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Report Actions */}
          <Card className="order-2 h-full lg:order-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                <span>Export reports</span>
              </CardTitle>
              <CardDescription>
                Generate and download assessment reports for your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportActions />
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card className="order-1 h-full lg:order-2">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <span>Recent submissions</span>
                </CardTitle>
                <CardDescription>
                  Latest assessments completed for your cooperative.
                </CardDescription>
              </div>
              <Link to="/user/submissions">
                <Button variant="outline" size="sm">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {(isLoading || isLoadingCoopFromPath) && (
                <div className="flex min-h-[160px] items-center justify-center">
                  <LoadingSpinner />
                </div>
              )}
              {(error || coopFromPathError) && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <p className="font-medium">Unable to load submissions.</p>
                  <p className="mt-1 opacity-90">
                    {error?.message || (coopFromPathError as Error)?.message}
                  </p>
                </div>
              )}
              {!isLoading &&
                !error &&
                (!submissions || submissions.length === 0) && (
                  <div className="flex min-h-[120px] items-center justify-center text-sm text-muted-foreground">
                    No submissions found yet. Results will appear here once
                    assessments are completed.
                  </div>
                )}
              {!isLoading &&
                !error &&
                submissions &&
                submissions.length > 0 && (
                  <SubmissionList
                    submissions={submissions}
                    limit={3}
                    basePath="/user"
                  />
                )}
            </CardContent>
          </Card>
        </section>

        {/* Latest Submission Chart */}
        {latestSubmission && (
          <section aria-label="Latest assessment results">
            <Card>
              <CardHeader>
                <CardTitle>Latest assessment results</CardTitle>
                <CardDescription>
                  Compare current and desired states for each dimension in the
                  most recent submission.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubmissionChart submission={latestSubmission} />
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
