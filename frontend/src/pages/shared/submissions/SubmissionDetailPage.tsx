import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useCooperationIdFromPath } from "@/hooks/cooperations/useCooperationIdFromPath";
import { useSubmissionSummary } from "@/hooks/submissions/useSubmissionSummary";
import { useSubmissionSummaryByOrganization } from "@/hooks/submissions/useSubmissionSummaryByOrganization";
import { useSubmissionSummaryByCooperation } from "@/hooks/submissions/useSubmissionSummaryByCooperation";
import { SubmissionDetail } from "@/components/shared/submissions/SubmissionDetail";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useGenerateAndExportReport } from "@/hooks/reports/useGenerateAndExportReport";
import { useGenerateAndExportWordReport } from "@/hooks/reports/useGenerateAndExportWordReport";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SubmissionDetailPage() {
  const { t } = useTranslation();
  const { submissionId } = useParams<{ submissionId: string }>();
  const { user } = useAuth();
  const organizationId = useOrganizationId();
  const cooperationIdFromRoute = useCooperationId();
  const {
    cooperationId: cooperationIdFromPath,
    isLoading: isLoadingCoopFromPath,
    error: coopFromPathError,
  } = useCooperationIdFromPath();
  const cooperationId = cooperationIdFromRoute || cooperationIdFromPath || null;

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
    {
      enabled:
        Boolean(isCoopAdminOrUser && cooperationId) && !isLoadingCoopFromPath,
    },
  );

  // Determine which hook result to use based on role
  const {
    data: summary,
    isLoading,
    error,
  } = isOrgAdmin ? orgHook : isCoopAdminOrUser ? coopHook : baseHook;

  // Report download logic
  const generatePdfMutation = useGenerateAndExportReport();
  const generateWordMutation = useGenerateAndExportWordReport();

  const handleDownloadPdf = () => {
    if (submissionId) {
      generatePdfMutation.mutate(submissionId);
    }
  };

  const handleDownloadWord = () => {
    if (submissionId) {
      generateWordMutation.mutate(submissionId);
    }
  };

  const isPending = generatePdfMutation.isPending || generateWordMutation.isPending;

  return (
    <div className="overflow-y-auto h-full bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t('sharedSubmissions.detail.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('sharedSubmissions.detail.description')}
            </p>
          </div>
          {summary && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={isPending}
                className="flex-1 sm:flex-initial"
              >
                {generatePdfMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {t('sharedSubmissions.detail.exportPdf')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadWord}
                disabled={isPending}
                className="flex-1 sm:flex-initial"
              >
                {generateWordMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {t('sharedSubmissions.detail.exportWord')}
              </Button>
            </div>
          )}
        </header>


        {(isLoading || isLoadingCoopFromPath) && (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40">
            <LoadingSpinner />
          </div>
        )}

        {(error || coopFromPathError) && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-semibold">{t('sharedSubmissions.detail.errorLoading')}</p>
            <p className="mt-1 opacity-90">
              {error?.message || (coopFromPathError as Error)?.message}
            </p>
          </div>
        )}

        {summary && <SubmissionDetail summary={summary} />}

        {!summary && !isLoading && !error && (
          <div className="rounded-lg border border-muted-foreground/30 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {t('sharedSubmissions.detail.unavailable')}
          </div>
        )}
      </div>
    </div>
  );
}
