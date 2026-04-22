import {
  dgrvAdminConsolidatedReport,
  orgAdminConsolidatedReport,
} from "@/openapi-client/services.gen";
import { db } from "@/services/db";

// Use a simple key-value store in IndexedDB via a dedicated table
// We reuse the action_plans table pattern — store under a known key in a generic cache
// Actually we'll use localStorage for simplicity since consolidated reports are read-only display data

const CACHE_KEY_ORG = "consolidated_report_org_";
const CACHE_KEY_DGRV = "consolidated_report_dgrv";

const saveToCache = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
};

const loadFromCache = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const consolidatedReportRepository = {
  getDgrvAdminConsolidatedReport: async () => {
    if (!navigator.onLine) {
      const cached = loadFromCache(CACHE_KEY_DGRV);
      if (cached) return { data: cached, success: true } as any;
      return null;
    }
    try {
      const result = await dgrvAdminConsolidatedReport();
      if (result?.data) saveToCache(CACHE_KEY_DGRV, result.data);
      return result;
    } catch (error) {
      const cached = loadFromCache(CACHE_KEY_DGRV);
      if (cached) return { data: cached, success: true } as any;
      throw error;
    }
  },

  getOrgAdminConsolidatedReport: async (organizationId: string) => {
    const cacheKey = CACHE_KEY_ORG + organizationId;
    if (!navigator.onLine) {
      const cached = loadFromCache(cacheKey);
      if (cached) return { data: cached, success: true } as any;
      return null;
    }
    try {
      const result = await orgAdminConsolidatedReport({ organizationId });
      if (result?.data) saveToCache(cacheKey, result.data);
      return result;
    } catch (error) {
      const cached = loadFromCache(cacheKey);
      if (cached) return { data: cached, success: true } as any;
      throw error;
    }
  },
};
