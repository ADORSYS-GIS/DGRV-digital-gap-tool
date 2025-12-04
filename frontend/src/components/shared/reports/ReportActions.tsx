import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SelectSubmissionModal } from "./SelectSubmissionModal";
import { useGenerateReport } from "@/hooks/reports/useGenerateReport";
import { useDownloadReportByAssessment } from "@/hooks/reports/useDownloadReportByAssessment";
import { usePollReportStatus } from "@/hooks/reports/usePollReportStatus";
import type { ReportFormat, ReportType } from "@/openapi-client";

export const ReportActions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"generate" | "export">(
    "generate",
  );
  const [pollingReportId, setPollingReportId] = useState<string | null>(null);

  const { data: reportStatus } = usePollReportStatus(pollingReportId);

  useEffect(() => {
    if (pollingReportId && reportStatus?.status === "Completed") {
      toast.success("Report successfully generated!");
      setPollingReportId(null);
    } else if (pollingReportId && reportStatus?.status === "Failed") {
      toast.error("Report generation failed.");
      setPollingReportId(null);
    }
  }, [reportStatus, pollingReportId]);

  const generateReportMutation = useGenerateReport((reportId) => {
    toast.info("Report generation started... Polling for status will begin shortly.");
    // Add a small delay to mitigate race condition with database transaction
    setTimeout(() => {
      setPollingReportId(reportId);
    }, 500);
  });

  const downloadReportMutation = useDownloadReportByAssessment();

  const handleOpenModal = (type: "generate" | "export") => {
    setActionType(type);
    setIsModalOpen(true);
  };

  const handleSelectSubmission = (assessmentId: string) => {
    setIsModalOpen(false);
    if (actionType === "generate") {
      generateReportMutation.mutate({
        requestBody: {
          assessment_id: assessmentId,
          title: "Assessment Report",
          report_type: "Summary" as ReportType,
          format: "Pdf" as ReportFormat,
        },
      });
    } else {
      downloadReportMutation.mutate(assessmentId);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => handleOpenModal("generate")}
          disabled={generateReportMutation.isPending || !!pollingReportId}
        >
          {pollingReportId ? "Generating..." : "Generate Report"}
        </Button>
        <Button onClick={() => handleOpenModal("export")} variant="outline">
          Export Report
        </Button>
      </div>
      <SelectSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectSubmission}
      />
    </>
  );
};