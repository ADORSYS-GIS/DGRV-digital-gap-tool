import {
  dgrvAdminConsolidatedReport,
  orgAdminConsolidatedReport,
} from "@/openapi-client/services.gen";
import { ConsolidatedReport } from "@/openapi-client/types.gen";

class ConsolidatedReportRepository {
  async getDgrvAdminConsolidatedReport(): Promise<ConsolidatedReport> {
    const response = await dgrvAdminConsolidatedReport();
    return response;
  }

  async getOrgAdminConsolidatedReport(
    organizationId: string,
  ): Promise<ConsolidatedReport> {
    const response = await orgAdminConsolidatedReport({ organizationId });
    return response;
  }
}

export const consolidatedReportRepository = new ConsolidatedReportRepository();
