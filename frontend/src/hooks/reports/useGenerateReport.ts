import { useMutation } from "@tanstack/react-query";
import { generateReport } from "@/openapi-client/services.gen";
import type { GenerateReportData } from "@/openapi-client/types.gen";
import { toast } from "sonner";

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: (data: GenerateReportData) => {
      const promise = generateReport(data);
      toast.promise(promise, {
        loading: "Generating report...",
        success: (res) =>
          `Report generation started successfully! Report ID: ${res.data?.report_id}`,
        error: (err) => `Failed to generate report: ${err.message}`,
      });
      return promise;
    },
  });
};