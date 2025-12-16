import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
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
      <div className="flex flex-col items-start space-y-4">
        <p className="text-sm text-muted-foreground">
          Select a submission to generate a detailed PDF report.
        </p>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="default"
          className="w-full sm:w-auto"
          disabled={downloadReportMutation.isPending}
        >
          {downloadReportMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Choose Submission to Export
            </>
          )}
        </Button>
        {downloadReportMutation.isError && (
          <p className="text-sm text-destructive">
            Failed to download report. Please try again.
          </p>
        )}
      </div>
      <SelectSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectSubmission}
      />
    </>
  );
};
