import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateReport } from "@/openapi-client/services.gen";
import type { GenerateReportData } from "@/openapi-client/types.gen";

export const useGenerateReport = (
  onSuccessCallback: (reportId: string) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateReportData) => generateReport(data),
    onSuccess: (res) => {
      const reportId = res.data?.report_id;
      if (reportId) {
        onSuccessCallback(reportId);
        queryClient.invalidateQueries({ queryKey: ["reportStatus", reportId] });
      }
    },
  });
};
