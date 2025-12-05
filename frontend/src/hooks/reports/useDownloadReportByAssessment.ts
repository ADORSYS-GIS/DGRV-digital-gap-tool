import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/openapi-client/core/ApiError";
import { downloadLatestReportByAssessment } from "@/openapi-client/services.gen";

export const useDownloadReportByAssessment = () => {
  return useMutation({
    mutationFn: async (assessmentId: string) => {
      // The OpenAPI client already returns a Blob for binary responses
      const blob = await downloadLatestReportByAssessment({
        assessmentId,
      });

      // Create a URL from the blob
      const url = window.URL.createObjectURL(blob as Blob);

      // Create a link and click it to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${assessmentId}.pdf`);
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
