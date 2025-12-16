import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/openapi-client/core/ApiError";
import { downloadLatestReportByAssessment } from "@/openapi-client/services.gen";

export const useDownloadReportByAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assessmentId: string) => {
      // Try to get the assessment title from any cached submission summary
      const cachedSummaries =
        queryClient
          .getQueriesData<any>({
            queryKey: ["submissions"],
          })
          .flatMap(([, data]) => (Array.isArray(data) ? data : [])) || [];

      const matchingSummary = cachedSummaries.find(
        (s) => s?.assessment?.assessment_id === assessmentId,
      );
      const assessmentTitle =
        matchingSummary?.assessment?.document_title || "report";

      // The OpenAPI client already returns a Blob for binary responses
      const blob = await downloadLatestReportByAssessment({
        assessmentId,
      });

      // Create a URL from the blob
      const url = window.URL.createObjectURL(blob as Blob);

      // Create a link and click it to trigger download
      const link = document.createElement("a");
      link.href = url;
      // Use a filesystem-safe file name based on assessment title
      const safeTitle = assessmentTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
      link.setAttribute(
        "download",
        `${safeTitle || "report"}-${assessmentId}.pdf`,
      );
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
    onSuccess: () => {
      toast.success("Report downloaded successfully");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) {
        toast.error("Report not found. Please generate it first.");
      } else {
        toast.error("Failed to download report");
      }
      console.error(error);
    },
  });
};
