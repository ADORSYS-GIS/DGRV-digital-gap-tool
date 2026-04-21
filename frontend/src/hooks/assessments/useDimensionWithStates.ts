import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { IDimensionWithStates } from "@/types/dimension";

export const useDimensionWithStates = (dimensionId?: string) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useQuery<IDimensionWithStates>({
    queryKey: ["dimensionWithStates", dimensionId, lang],
    queryFn: async () => {
      if (!dimensionId) throw new Error("Dimension ID is required");

      // If language is English (or "all"), fetch directly
      if (lang === "en" || lang === "all") {
        return dimensionAssessmentRepository.getDimensionWithStates(dimensionId, lang);
      }

      // For other languages: resolve the language-specific dimension_id
      // by finding the dimension row with the same dimension_key but target language
      const allDims = await dimensionRepository.getAll("all");

      // First find the English row to get the dimension_key
      const englishRow = allDims.find((d) => d.id === dimensionId);
      const dimKey = englishRow ? (englishRow as any).dimension_key ?? dimensionId : dimensionId;

      // Find the target language row
      const targetRow = allDims.find(
        (d) => ((d as any).dimension_key ?? d.id) === dimKey && (d as any).language === lang,
      );

      if (targetRow) {
        // Fetch states for the language-specific dimension row
        return dimensionAssessmentRepository.getDimensionWithStates(targetRow.id, lang);
      }

      // Fallback: fetch English version if no translation exists
      return dimensionAssessmentRepository.getDimensionWithStates(dimensionId, "en");
    },
    enabled: !!dimensionId,
  });
};
