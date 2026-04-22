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
import { useAuth } from "@/hooks/useAuth";
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useCooperationIdFromPath } from "@/hooks/cooperations/useCooperationIdFromPath";
import {
  ClipboardCheck,
  ClipboardList,
  FilePenLine,
  History,
  Download,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { ReportActions } from "@/components/shared/reports/ReportActions";
import { SubmissionChart } from "@/components/shared/submissions/SubmissionChart";
import { useTranslation, Trans } from "react-i18next";
import { AssessmentSummary } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useAllDimensionStates } from "@/hooks/dimensions/useAllDimensionStates";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";
import { IDimensionAssessment } from "@/types/dimension";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const cooperationIdFromRoute = useCooperationId();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const {
    cooperationId: cooperationIdFromPath,
    cooperationName,
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

  const { data: dimensions } = useDimensions('all');
  const { data: translatedDimensions } = useDimensions(lang);
  const { data: allDimensionStates } = useAllDimensionStates();

  const mergedDimensions = React.useMemo(() => {
    if (!dimensions) return [];
    const translatedMap = new Map((translatedDimensions ?? []).map((d) => [d.id, d]));
    return dimensions.map((d) => translatedMap.get(d.id) ?? d);
  }, [dimensions, translatedDimensions]);

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

  const latestSubmissionId = submissions[0]?.id ?? null;

  const [latestAssessments, setLatestAssessments] = React.useState<
    IDimensionAssessment[]
  >([]);

  React.useEffect(() => {
    if (!latestSubmissionId) return;
    dimensionAssessmentRepository
      .getByAssessment(latestSubmissionId)
      .then(setLatestAssessments)
      .catch(console.error);
  }, [latestSubmissionId]);

  return (
    <div className="overflow-y-auto h-full bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <header className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/80">
              {cooperationName || t("userDashboard.header.panel")}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("userDashboard.header.title")}
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            <Trans
              i18nKey="userDashboard.header.welcome"
              values={{ name: user?.name || user?.preferred_username || t("userDashboard.header.defaultUser") }}
              components={{ 1: <span className="font-medium text-foreground" /> }}
            />
          </p>
        </header>

        {/* Management Tools Grid */}
        <section aria-label="Primary user actions">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            <Link to="/user/assessments">
              <DashboardCard
                title={t("userDashboard.cards.answer.title")}
                description={t("userDashboard.cards.answer.description")}
                icon={FilePenLine}
                variant="default"
              />
            </Link>
            <Link to="/user/action-plans">
              <DashboardCard
                title={t("userDashboard.cards.actionPlan.title")}
                description={t("userDashboard.cards.actionPlan.description")}
                icon={ClipboardList}
                variant="default"
              />
            </Link>
            <Link
              to="/user/submissions"
              className="md:col-span-3 lg:col-span-1"
            >
              <DashboardCard
                title={t("userDashboard.cards.submissions.title")}
                description={t("userDashboard.cards.submissions.description")}
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
                <span>{t("userDashboard.reports.export.title")}</span>
              </CardTitle>
              <CardDescription>
                {t("userDashboard.reports.export.description")}
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
                  <span>{t("userDashboard.reports.recent.title")}</span>
                </CardTitle>
                <CardDescription>
                  {t("userDashboard.reports.recent.description")}
                </CardDescription>
              </div>
              <Link to="/user/submissions">
                <Button variant="outline" size="sm">
                  {t("userDashboard.reports.recent.viewAll")}
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
                  <p className="font-medium">{t("userDashboard.reports.recent.error")}</p>
                  <p className="mt-1 opacity-90">
                    {error?.message || (coopFromPathError as Error)?.message}
                  </p>
                </div>
              )}
              {!isLoading &&
                !error &&
                (!submissions || submissions.length === 0) && (
                  <div className="flex min-h-[120px] items-center justify-center text-sm text-muted-foreground">
                    {t("userDashboard.reports.recent.empty")}
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
        {latestAssessments.length > 0 && dimensions && allDimensionStates && (
          <section aria-label="Latest assessment results">
            <Card>
              <CardHeader>
                <CardTitle>{t("userDashboard.chart.title")}</CardTitle>
                <CardDescription>
                  {t("userDashboard.chart.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubmissionChart
                  assessments={latestAssessments}
                  assessmentName={submissions[0]?.assessment?.document_title || ""}
                  dimensions={mergedDimensions}
                  allDimensionStates={allDimensionStates}
                />
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
