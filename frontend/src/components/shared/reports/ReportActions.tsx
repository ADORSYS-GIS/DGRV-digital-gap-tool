import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SelectSubmissionModal } from "./SelectSubmissionModal";
import { useDownloadReportByAssessment } from "@/hooks/reports/useDownloadReportByAssessment";

export const ReportActions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const downloadReportMutation = useDownloadReportByAssessment();

  const handleSelectSubmission = (assessmentId: string) => {
    setIsModalOpen(false);
    downloadReportMutation.mutate(assessmentId);
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        <Button onClick={() => setIsModalOpen(true)} variant="outline">
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
