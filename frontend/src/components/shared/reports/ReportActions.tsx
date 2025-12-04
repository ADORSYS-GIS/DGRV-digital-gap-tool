import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectSubmissionModal } from "./SelectSubmissionModal";
import { useGenerateReport } from "@/hooks/reports/useGenerateReport";
import { useDownloadReportByAssessment } from "@/hooks/reports/useDownloadReportByAssessment";
import type { ReportFormat, ReportType } from "@/openapi-client";

export const ReportActions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"generate" | "export">(
    "generate",
  );
  const generateReportMutation = useGenerateReport();
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
        <Button onClick={() => handleOpenModal("generate")}>
          Generate Report
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