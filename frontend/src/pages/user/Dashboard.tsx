/**
 * User dashboard page that displays assessment information and user statistics.
 * This page provides:
 * - Welcome message with user name
 * - Quick statistics overview
 * - Assessment management section
 * - Placeholder for additional content
 */
/**
 * Second admin dashboard page for cooperative management.
 * This page provides:
 * - Cooperative and user management tools
 * - Assessment creation and submission tracking
 * - Action plan overview
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
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
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
import { AssessmentSummary } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";
import { useTranslation } from "react-i18next";

const UserDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: submissionsData, isLoading, error } = useSubmissions();

  const submissions: AssessmentSummary[] =
    submissionsData?.map((s) => ({
      id: s.id,
      assessment: {
        assessment_id: s.id,
        name: s.name,
        organization_id: s.organization_id,
        cooperation_id: s.cooperation_id ?? null,
        created_at: s.created_at,
        status: s.status,
        lastError: s.lastError,
        started_at: null,
        completed_at: null,
        dimensions_id: s.dimensionIds || [],
        document_title: "",
        updated_at: "",
      },
      dimension_assessments: [],
      gaps_count: 0,
      recommendations_count: 0,
      overall_score: null,
      syncStatus: SyncStatus.SYNCED,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("userDashboard.title")}
        </h1>
        <p className="text-gray-600">
          {t("userDashboard.welcomeMessage")}{" "}
          {user?.name || user?.preferred_username || "Administrator"}.
        </p>
      </div>

      {/* Management Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/user/assessments">
          <DashboardCard
            title={t("userDashboard.createAssessmentTitle")}
            description={t("userDashboard.createAssessmentDescription")}
            icon={FilePlus2}
            variant="default"
          />
        </Link>
        <Link to="/user/action-plans">
          <DashboardCard
            title={t("userDashboard.viewActionPlanTitle")}
            description={t("userDashboard.viewActionPlanDescription")}
            icon={ClipboardList}
            variant="default"
          />
        </Link>
        <Link to="/user/submissions">
          <DashboardCard
            title={t("userDashboard.viewSubmissionsTitle")}
            description={t("userDashboard.viewSubmissionsDescription")}
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
            {t("userDashboard.exportReportsTitle")}
          </CardTitle>
          <CardDescription>
            {t("userDashboard.exportReportsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportActions />
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              {t("userDashboard.recentSubmissionsTitle")}
            </CardTitle>
            <CardDescription>
              {t("userDashboard.recentSubmissionsDescription")}
            </CardDescription>
          </div>
          <Link to="/user/submissions">
            <Button variant="outline">{t("userDashboard.viewAll")}</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading && <LoadingSpinner />}
          {error && (
            <p className="text-red-500">
              {t("userDashboard.errorMessage", { message: error.message })}
            </p>
          )}
          {submissions && (
            <SubmissionList
              submissions={submissions}
              limit={5}
              basePath="user"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
