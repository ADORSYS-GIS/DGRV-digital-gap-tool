import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ReportActions } from "@/components/shared/reports/ReportActions";
import { SubmissionChart } from "@/components/shared/submissions/SubmissionChart";
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
import { useAllDimensionStates } from "@/hooks/dimensions/useAllDimensionStates";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";
import {
  AssessmentSummary,
} from "@/types/assessment";
import { IDimensionAssessment } from "@/types/dimension";
import { SyncStatus } from "@/types/sync";
import {
  Building2,
  ClipboardCheck,
  ClipboardList,
  Download,
  FilePlus2,
  FileText,
  History,
  Users,
} from "lucide-react";
import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

const SecondAdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const { user } = useAuth();
  const organizationId = useOrganizationId();
  const {
    data: submissionsData = [],
    isLoading,
    error,
  } = useSubmissionsByOrganization(organizationId || "", {
    enabled: !!organizationId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: allDimensions } = useDimensions('all');
  const { data: translatedDimensions } = useDimensions(lang);
  const { data: allDimensionStates } = useAllDimensionStates();

  // Merge: use translated name when available, fall back to 'all' name
  const mergedDimensions = React.useMemo(() => {
    if (!allDimensions) return [];
    const translatedMap = new Map((translatedDimensions ?? []).map((d) => [d.id, d]));
    return allDimensions.map((d) => translatedMap.get(d.id) ?? d);
  }, [allDimensions, translatedDimensions]);

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
        <header className="space-y-2">
          <div>
            {user?.organization_name && (
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/80">
                {user.organization_name}
              </p>
            )}
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t('secondAdmin.header.title')}
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            <Trans
              i18nKey="secondAdmin.header.welcome"
              values={{ name: user?.name || user?.preferred_username || t('secondAdmin.header.defaultUser') }}
              components={{ 1: <span className="font-medium text-foreground" /> }}
            >
              Welcome back <span className="font-medium text-foreground">{user?.name || user?.preferred_username || t('secondAdmin.header.defaultUser')}</span>. Use these tools to manage cooperatives, users, assessments, and action plans.
            </Trans>
          </p>
        </header>

        {/* Management Tools Grid */}
        <section aria-label="Primary management actions">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link to="/second-admin/cooperations">
              <DashboardCard
                title={t('secondAdmin.cards.manageCoops.title')}
                description={t('secondAdmin.cards.manageCoops.description')}
                icon={Building2}
                variant="default"
              />
            </Link>
            <Link to="/second-admin/manage-cooperation-users">
              <DashboardCard
                title={t('secondAdmin.cards.manageUsers.title')}
                description={t('secondAdmin.cards.manageUsers.description')}
                icon={Users}
                variant="default"
              />
            </Link>
            <Link to="/second-admin/assessments">
              <DashboardCard
                title={t('secondAdmin.cards.createAssessment.title')}
                description={t('secondAdmin.cards.createAssessment.description')}
                icon={FilePlus2}
                variant="default"
              />
            </Link>
            <Link to="/second-admin/action-plans">
              <DashboardCard
                title={t('secondAdmin.cards.viewActionPlan.title')}
                description={t('secondAdmin.cards.viewActionPlan.description')}
                icon={ClipboardList}
                variant="default"
              />
            </Link>
            <Link to="/second-admin/submissions">
              <DashboardCard
                title={t('secondAdmin.cards.viewSubmissions.title')}
                description={t('secondAdmin.cards.viewSubmissions.description')}
                icon={ClipboardCheck}
                variant="default"
              />
            </Link>
            <Link to={`/second-admin/consolidated-report/${organizationId}`}>
              <DashboardCard
                title={t('secondAdmin.cards.consolidatedReport.title')}
                description={t('secondAdmin.cards.consolidatedReport.description')}
                icon={FileText}
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
                <span>{t('secondAdmin.reports.export.title')}</span>
              </CardTitle>
              <CardDescription>
                {t('secondAdmin.reports.export.description')}
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
                  <span>{t('secondAdmin.reports.recent.title')}</span>
                </CardTitle>
                <CardDescription>
                  {t('secondAdmin.reports.recent.description')}
                </CardDescription>
              </div>
              <Link to="/second-admin/submissions">
                <Button variant="outline" size="sm">
                  {t('secondAdmin.reports.recent.viewAll')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex min-h-[160px] items-center justify-center">
                  <LoadingSpinner />
                </div>
              )}
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <p className="font-medium">{t('secondAdmin.reports.recent.error')}</p>
                  <p className="mt-1 opacity-90">{error.message}</p>
                </div>
              )}
              {!isLoading &&
                !error &&
                (!submissions || submissions.length === 0) && (
                  <div className="flex min-h-[120px] items-center justify-center text-sm text-muted-foreground">
                    {t('secondAdmin.reports.recent.empty')}
                  </div>
                )}
              {!isLoading &&
                !error &&
                submissions &&
                submissions.length > 0 && (
                  <SubmissionList
                    submissions={submissions}
                    limit={3}
                    basePath="/second-admin"
                  />
                )}
            </CardContent>
          </Card>
        </section>

        {/* Latest Submission Chart */}
        {latestAssessments.length > 0 && allDimensions && (
          <section aria-label={t('secondAdmin.chart.title')}>
            <Card>
              <CardHeader>
                <CardTitle>{t('secondAdmin.chart.title')}</CardTitle>
                <CardDescription>
                  {t('secondAdmin.chart.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubmissionChart
                  assessments={latestAssessments}
                  assessmentName={submissions[0]?.assessment?.document_title || ""}
                  dimensions={mergedDimensions}
                  allDimensionStates={allDimensionStates ?? []}
                />
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
};

export default SecondAdminDashboard;
