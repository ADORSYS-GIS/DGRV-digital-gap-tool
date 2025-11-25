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
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">An error occurred: {error.message}</p>
      )}
      {summary && <SubmissionDetail summary={summary} />}
    </div>
  );
}
