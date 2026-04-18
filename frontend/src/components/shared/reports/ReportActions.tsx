import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectSubmissionModal } from "./SelectSubmissionModal";
import { useGenerateAndExportReport } from "@/hooks/reports/useGenerateAndExportReport";
import { useTranslation } from "react-i18next";

export const ReportActions: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const generateMutation = useGenerateAndExportReport();

  const handleSelectSubmission = (assessmentId: string) => {
    setIsModalOpen(false);
    generateMutation.mutate(assessmentId);
  };

  return (
    <>
      <div className="flex flex-col items-start space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("shared.reports.selectSubmissionInfo")}
        </p>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="default"
          className="w-full sm:w-auto"
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("shared.reports.generating")}
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {t("shared.reports.generatePdf")}
            </>
          )}
        </Button>
        {generateMutation.isError && (
          <p className="text-sm text-destructive">
            {t("shared.reports.generationFailed")}
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
