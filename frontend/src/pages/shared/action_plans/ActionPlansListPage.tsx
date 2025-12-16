import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { KanbanBoard } from "@/components/shared/action_plans/KanbanBoard";
import { AssessmentSummary } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";

export default function ActionPlansListPage() {
  const { user } = useAuth();
  const organizationId = useOrganizationId();
  const cooperationId = useCooperationId();

  const [selectedSubmission, setSelectedSubmission] =
    useState<AssessmentSummary | null>(null);

  const userRoles = (user?.roles || []).map((role) => role.toLowerCase());
  const isOrgAdmin = userRoles.includes(ROLES.ORG_ADMIN.toLowerCase());
  const isCoopUser =
    userRoles.includes(ROLES.COOP_USER.toLowerCase()) ||
    userRoles.includes(ROLES.COOP_ADMIN.toLowerCase());

  const {
    data: orgSubmissions = [],
    isLoading: isLoadingOrg,
    error: orgError,
  } = useSubmissionsByOrganization(organizationId || "", {
    enabled: isOrgAdmin && !!organizationId,
  });

  const {
    data: coopSubmissions = [],
    isLoading: isLoadingCoop,
    error: coopError,
  } = useSubmissionsByCooperation(cooperationId || "", {
    enabled: isCoopUser && !!cooperationId,
  });

  const submissions: AssessmentSummary[] = useMemo(() => {
    const raw =
      isOrgAdmin && orgSubmissions
        ? orgSubmissions
        : isCoopUser && coopSubmissions
          ? coopSubmissions
          : [];

    return (raw || []).map((s) => ({
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
  }, [coopSubmissions, isCoopUser, isOrgAdmin, orgSubmissions]);

  const isLoading = isOrgAdmin ? isLoadingOrg : isCoopUser ? isLoadingCoop : false;
  const error = isOrgAdmin ? orgError : isCoopUser ? coopError : null;

  const handleSubmissionSelect = (submissionId: string) => {
    const submission = submissions.find((s) => s.id === submissionId);
    if (submission) {
      setSelectedSubmission(submission);
    } else {
      console.error(`Submission with ID ${submissionId} not found.`);
    }
  };

  if (!isOrgAdmin && !isCoopUser) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border-l-4 border-destructive bg-destructive/10 px-4 py-3">
          <p className="text-sm font-medium text-destructive">
            You don&apos;t have permission to view action plans. Please contact
            your administrator.
          </p>
        </div>
      </div>
    );
  }

  if (selectedSubmission) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Action plan
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Managing actions for{" "}
                <span className="font-medium text-foreground">
                  {selectedSubmission.assessment.document_title}
                </span>
                .
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSubmission(null)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← Back to submissions
            </button>
          </div>

          <KanbanBoard submissionId={selectedSubmission.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Action plans
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Choose a completed assessment submission to view and manage its
              action plan.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error loading submissions:{" "}
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && submissions.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Select a submission
            </h2>
            <SubmissionList
              submissions={submissions}
              onSubmissionSelect={handleSubmissionSelect}
              basePath={location.pathname.split("/").slice(0, 2).join("/")}
            />
          </section>
        )}

        {!isLoading && !error && submissions.length === 0 && (
          <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
            No submissions found yet. Once assessments are completed, their
            action plans will be available here.
          </div>
        )}
      </div>
    </div>
  );
}
