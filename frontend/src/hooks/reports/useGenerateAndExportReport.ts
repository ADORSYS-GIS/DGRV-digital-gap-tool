import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OpenAPI } from "@/openapi-client/core/OpenAPI";
import { authService } from "@/services/shared/authService";

/**
 * Generates a fresh PDF from current assessment + action plan data,
 * overwrites the single stored file for this assessment, and downloads it.
 */
export const useGenerateAndExportReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assessmentId: string) => {
      const token = await authService.getAccessToken();
      const baseUrl = OpenAPI.BASE || "";

      const response = await fetch(
        `${baseUrl}/reports/assessment/${assessmentId}/generate-and-export`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Get assessment title from cache for the filename
      const cachedSummaries =
        queryClient
          .getQueriesData<any>({ queryKey: ["submissions"] })
          .flatMap(([, data]) => (Array.isArray(data) ? data : [])) || [];

      const match = cachedSummaries.find(
        (s: any) => s?.assessment?.assessment_id === assessmentId,
      );
      const title = match?.assessment?.document_title || "report";
      const safeTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${safeTitle || "report"}-${assessmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
    onSuccess: () => {
      toast.success("Report generated and downloaded successfully");
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate report",
      );
      console.error(error);
    },
  });
};
