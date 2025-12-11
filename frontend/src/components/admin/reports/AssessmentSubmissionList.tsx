import React from "react";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDownloadReportByAssessment } from "@/hooks/reports/useDownloadReportByAssessment";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ApiError } from "@/openapi-client/core/ApiError";

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
  const downloadReportMutation = useDownloadReportByAssessment();

  const handleExportReport = (assessmentId: string) => {
    downloadReportMutation.mutate(assessmentId, {
      onSuccess: () => {
        toast.success("Report downloaded successfully!");
      },
      onError: (err) => {
        const errorMessage =
          err instanceof ApiError ? err.message : "An unknown error occurred";
        toast.error(`Failed to download report: ${errorMessage}`);
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <p className="text-red-500">Error loading submissions: {error.message}</p>
    );
  }

  return (
    <div className="grid gap-4">
      {submissions?.length === 0 && (
        <p>No assessment submissions found for this organization.</p>
      )}
      {submissions?.map((submission) => (
        <Card key={submission.assessment.assessment_id}>
          <CardHeader>
            <CardTitle>{submission.assessment.document_title}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Submitted on:{" "}
                {submission.assessment.completed_at
                  ? new Date(
                      submission.assessment.completed_at,
                    ).toLocaleDateString()
                  : "N/A"}
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
                Export Report
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
