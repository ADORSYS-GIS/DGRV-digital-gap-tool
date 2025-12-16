import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useSubmissionSummary } from "@/hooks/submissions/useSubmissionSummary";
import { useSubmissionSummaryByOrganization } from "@/hooks/submissions/useSubmissionSummaryByOrganization";
import { useSubmissionSummaryByCooperation } from "@/hooks/submissions/useSubmissionSummaryByCooperation";
import { SubmissionDetail } from "@/components/shared/submissions/SubmissionDetail";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function SubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { user } = useAuth();
  const organizationId = useOrganizationId();
  const cooperationId = useCooperationId();

  const isOrgAdmin = user?.roles?.includes(ROLES.ORG_ADMIN);
  const isCoopAdminOrUser = user?.roles?.some((role) =>
    [ROLES.COOP_ADMIN, ROLES.COOP_USER].includes(role),
  );

  // Use the appropriate hook based on user role
  const baseHook = useSubmissionSummary(submissionId!);
  const orgHook = useSubmissionSummaryByOrganization(
    submissionId!,
    organizationId!,
    { enabled: Boolean(isOrgAdmin && organizationId) },
  );
  const coopHook = useSubmissionSummaryByCooperation(
    submissionId!,
    cooperationId!,
    { enabled: Boolean(isCoopAdminOrUser && cooperationId) },
  );

  // Determine which hook result to use based on role
  const {
    data: summary,
    isLoading,
    error,
  } = isOrgAdmin ? orgHook : isCoopAdminOrUser ? coopHook : baseHook;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Submission details
          </h1>
          <p className="text-sm text-muted-foreground">
            Review the assessment submission, its dimensions, and gap analysis.
          </p>
        </header>

        {isLoading && (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-semibold">Unable to load submission</p>
            <p className="mt-1 opacity-90">{error.message}</p>
          </div>
        )}

        {summary && <SubmissionDetail summary={summary} />}

        {!summary && !isLoading && !error && (
          <div className="rounded-lg border border-muted-foreground/30 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Submission details are unavailable. Please return to submissions and
            try again.
          </div>
        )}
      </div>
    </div>
  );
}
