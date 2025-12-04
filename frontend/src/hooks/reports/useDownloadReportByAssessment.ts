import { useMutation } from "@tanstack/react-query";
import { listReportsByAssessment } from "@/openapi-client/services.gen";
import { toast } from "sonner";

export const useDownloadReportByAssessment = () => {
  return useMutation({
    mutationFn: async (assessmentId: string) => {
      const response = await listReportsByAssessment({
        assessmentId,
      });

      // Create a blob from the response
      const blob = new Blob([response as unknown as BlobPart], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create a link and click it to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${assessmentId}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response;
    },
    onSuccess: () => {
      toast.success("Report downloaded successfully");
    },
    onError: (error) => {
      toast.error("Failed to download report");
      console.error(error);
    },
  });
};