import React from "react";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDownloadReportByAssessment } from "@/hooks/reports/useDownloadReportByAssessment";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ApiError } from "@/openapi-client/core/ApiError";
import { useTranslation } from "react-i18next";

interface AssessmentSubmissionListProps {
  organizationId: string;
}

export const AssessmentSubmissionList: React.FC<
  AssessmentSubmissionListProps
> = ({ organizationId }) => {
  const {
    data: submissions,
    isLoading,
    error,
  } = useSubmissionsByOrganization(organizationId);
  const { t } = useTranslation();
  const downloadReportMutation = useDownloadReportByAssessment();

  const handleExportReport = (assessmentId: string) => {
    downloadReportMutation.mutate(assessmentId, {
      onSuccess: () => {
        toast.success(t("adminReports.submissions.exportSuccess"));
      },
      onError: (err) => {
        const errorMessage =
          err instanceof ApiError ? err.message : t("common.noDescription");
        toast.error(t("adminReports.submissions.exportError", { error: errorMessage }));
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <p className="text-red-500">{t("adminReports.organizations.errorLoading", { error: error.message })}</p>
    );
  }

  return (
    <div className="grid gap-4">
      {submissions?.length === 0 && (
        <p>{t("adminReports.submissions.empty")}</p>
      )}
      {submissions?.map((submission) => (
        <Card key={submission.assessment.assessment_id}>
          <CardHeader>
            <CardTitle>{submission.assessment.document_title}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("adminReports.submissions.submittedOn")}:{" "}
                {submission.assessment.completed_at
                  ? new Date(
                    submission.assessment.completed_at,
                  ).toLocaleDateString()
                  : t("common.noTitle")}
              </p>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() =>
                  handleExportReport(submission.assessment.assessment_id)
                }
                disabled={downloadReportMutation.isPending}
              >
                {t("adminReports.submissions.exportReport")}
              </Button>
              <Link
                to={`/admin/action-plans/${submission.assessment.assessment_id}`}
              >
                <Button variant="outline">View Action Plan</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
