import { ConsolidatedReport } from "@/openapi-client";
import {
  dgrvAdminConsolidatedReport,
  orgAdminConsolidatedReport,
} from "@/openapi-client/services.gen";

export const getDgrvAdminConsolidatedReport =
  async (): Promise<ConsolidatedReport> => {
    const response = await dgrvAdminConsolidatedReport();
    return response;
  };

export const getOrgAdminConsolidatedReport = async (
  organizationId: string,
): Promise<ConsolidatedReport> => {
  const response = await orgAdminConsolidatedReport({ organizationId });
  return response;
};
