import { useMutation } from "@tanstack/react-query";
import { reportRepository } from "@/services/reports/reportRepository";

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: async (data: { submissionId: string; format: "pdf" | "docx" }) => {
      const response = await reportRepository.generateReport(data.submissionId, data.format);
      return response;
    },
  });
};