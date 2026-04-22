import { get, set } from "idb-keyval";
import {
  dgrvAdminConsolidatedReport,
  orgAdminConsolidatedReport,
} from "@/openapi-client/services.gen";

const CACHE_KEY_ORG = "consolidated_report_org_";
const CACHE_KEY_DGRV = "consolidated_report_dgrv";

export const consolidatedReportRepository = {
  getDgrvAdminConsolidatedReport: async () => {
    if (!navigator.onLine) {
      const cached = await get(CACHE_KEY_DGRV);
      if (cached) return { data: cached, success: true } as any;
      return null;
    }
    try {
      const result = await dgrvAdminConsolidatedReport();
      if (result) await set(CACHE_KEY_DGRV, result);
      return { data: result, success: true } as any;
    } catch (error) {
      const cached = await get(CACHE_KEY_DGRV);
      if (cached) return { data: cached, success: true } as any;
      throw error;
    }
  },

  getOrgAdminConsolidatedReport: async (organizationId: string) => {
    const cacheKey = CACHE_KEY_ORG + organizationId;
    if (!navigator.onLine) {
      const cached = await get(cacheKey);
      if (cached) return { data: cached, success: true } as any;
      return null;
    }
    try {
      const result = await orgAdminConsolidatedReport({ organizationId });
      if (result) await set(cacheKey, result);
      return { data: result, success: true } as any;
    } catch (error) {
      const cached = await get(cacheKey);
      if (cached) return { data: cached, success: true } as any;
      throw error;
    }
  },
};
