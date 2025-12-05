import { useQuery } from "@tanstack/react-query";
import { getReportStatus } from "@/openapi-client/services.gen";
import type { ReportStatus } from "@/openapi-client/types.gen";

export const usePollReportStatus = (reportId: string | null) => {
  return useQuery<{ status: ReportStatus }>({
    queryKey: ["reportStatus", reportId],
    queryFn: async () => {
      if (!reportId) {
        return { status: "Pending" as ReportStatus };
      }
      const response = await getReportStatus({ id: reportId });
      return { status: response.data?.status as ReportStatus };
    },
    enabled: !!reportId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "Completed" || status === "Failed" ? false : 3000;
    },
    refetchOnWindowFocus: false,
  });
};
