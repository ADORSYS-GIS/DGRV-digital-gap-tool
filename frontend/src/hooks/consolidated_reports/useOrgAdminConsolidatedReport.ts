import { useQuery } from "@tanstack/react-query";
import { consolidatedReportRepository } from "@/services/consolidated_reports/consolidatedReportRepository";

export const useOrgAdminConsolidatedReport = (organizationId: string) => {
  return useQuery({
    queryKey: ["orgAdminConsolidatedReport", organizationId],
    queryFn: () =>
      consolidatedReportRepository.getOrgAdminConsolidatedReport(
        organizationId,
      ),
    enabled: !!organizationId,
  });
};