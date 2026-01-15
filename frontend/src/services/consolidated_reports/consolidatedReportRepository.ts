import {
  dgrvAdminConsolidatedReport,
  orgAdminConsolidatedReport,
} from "@/openapi-client/services.gen";

export const consolidatedReportRepository = {
  getDgrvAdminConsolidatedReport: async () => {
    return await dgrvAdminConsolidatedReport();
  },

  getOrgAdminConsolidatedReport: async (organizationId: string) => {
    return await orgAdminConsolidatedReport({ organizationId });
  },
};