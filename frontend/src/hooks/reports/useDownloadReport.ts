import { useMutation } from "@tanstack/react-query";
import { downloadReport } from "@/openapi-client/services.gen";
import type { DownloadReportData } from "@/openapi-client/types.gen";
import { toast } from "sonner";

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: (data: DownloadReportData) => downloadReport(data),
    onSuccess: (response) => {
      const url = response.data?.download_url;
      if (url) {
        toast.success("Report is ready for download.", {
          description: "Your download will begin shortly.",
        });
        // Create a temporary link to trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", ""); // Or a more specific filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error("Download failed: No download URL was provided.");
      }
    },
    onError: (error) => {
      toast.error(`Failed to download report: ${error.message}`);
    },
  });
};