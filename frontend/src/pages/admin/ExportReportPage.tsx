import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SubmissionDetail } from "@/components/shared/submissions/SubmissionDetail";
import { Button } from "@/components/ui/button";
import { useSubmission } from "@/hooks/submissions/useSubmission";
import { useGenerateAndExportReport } from "@/hooks/reports/useGenerateAndExportReport";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const ExportReportPage: React.FC = () => {
  const { organizationId, submissionId } = useParams<{
    organizationId: string;
    submissionId: string;
  }>();
  const navigate = useNavigate();
  const generateMutation = useGenerateAndExportReport();
  const { t } = useTranslation();

  const { data: submission, isLoading, error } = useSubmission(submissionId || "");

  const handleExportReport = () => {
    if (submissionId) {
      generateMutation.mutate(submissionId);
    } else {
      toast.error(t("exportReport.missingId"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        {t("exportReport.loadingError", { message: error.message })}
      </div>
    );
  }

  if (!submission) {
    return <div className="text-center text-gray-500">{t("exportReport.notFound")}</div>;
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/reports/${organizationId}`)}
              className="text-gray-500 hover:text-primary hover:bg-primary/5 -ml-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> {t("exportReport.back")}
            </Button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            {t("exportReport.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("exportReport.subtitle")}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={handleExportReport}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t("exportReport.generating")}</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>{t("exportReport.generateBtn")}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-semibold text-gray-900">{t("exportReport.details")}</h2>
        </div>
        <div className="p-6">
          <SubmissionDetail summary={submission} />
        </div>
      </div>
    </div>
  );
};

export default ExportReportPage;
