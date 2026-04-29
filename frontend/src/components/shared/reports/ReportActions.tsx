import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectSubmissionModal } from "./SelectSubmissionModal";
import { useGenerateAndExportReport } from "@/hooks/reports/useGenerateAndExportReport";
import { useGenerateAndExportWordReport } from "@/hooks/reports/useGenerateAndExportWordReport";
import { useTranslation } from "react-i18next";


export const ReportActions: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "word">("pdf");
  const generatePdfMutation = useGenerateAndExportReport();
  const generateWordMutation = useGenerateAndExportWordReport();

  const handleSelectSubmission = (assessmentId: string) => {
    setIsModalOpen(false);
    if (selectedFormat === "pdf") {
      generatePdfMutation.mutate(assessmentId);
    } else {
      generateWordMutation.mutate(assessmentId);
    }
  };

  const isPending = generatePdfMutation.isPending || generateWordMutation.isPending;
  const isError = generatePdfMutation.isError || generateWordMutation.isError;


  return (
    <>
      <div className="flex flex-col items-start space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("shared.reports.selectSubmissionInfo")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={() => {
              setSelectedFormat("pdf");
              setIsModalOpen(true);
            }}
            variant="default"
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            {generatePdfMutation.isPending ? (
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

          <Button
            onClick={() => {
              setSelectedFormat("word");
              setIsModalOpen(true);
            }}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            {generateWordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("shared.reports.generating")}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t("shared.reports.generateWord")}
              </>
            )}
          </Button>
        </div>
        {isError && (
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
