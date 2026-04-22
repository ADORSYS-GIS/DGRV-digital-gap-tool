import { useQuery } from "@tanstack/react-query";
import { consolidatedReportRepository } from "@/services/consolidated_reports/consolidatedReportRepository";

export const useOrgAdminConsolidatedReport = (organizationId: string) => {
  return useQuery({
    queryKey: ["orgAdminConsolidatedReport", organizationId],
    queryFn: async () => {
      const result = await consolidatedReportRepository.getOrgAdminConsolidatedReport(organizationId);
      return result?.data ?? null;
    },
    enabled: !!organizationId,
  });
};
