import { useQuery } from "@tanstack/react-query";
import { consolidatedReportRepository } from "@/services/consolidated_reports/consolidatedReportRepository";

export const useDgrvAdminConsolidatedReport = () => {
  return useQuery({
    queryKey: ["dgrvAdminConsolidatedReport"],
    queryFn: async () => {
      const result = await consolidatedReportRepository.getDgrvAdminConsolidatedReport();
      return result?.data ?? null;
    },
  });
};
