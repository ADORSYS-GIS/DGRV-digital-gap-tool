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

      // Fetch all dimensions to resolve dimension_key
      const allDims = await dimensionRepository.getAll("all");

      // Find the row matching this dimensionId (could be any language)
      const matchedRow = allDims.find((d) => d.id === dimensionId);

      // Get the stable dimension_key — if not found, treat dimensionId as dimension_key
      const dimKey = matchedRow
        ? ((matchedRow as any).dimension_key ?? dimensionId)
        : dimensionId;

      // Find the row for the target language
      const targetRow = allDims.find(
        (d) =>
          ((d as any).dimension_key ?? d.id) === dimKey &&
          (d as any).language === lang,
      );

      if (targetRow) {
        return dimensionAssessmentRepository.getDimensionWithStates(targetRow.id, lang);
      }

      // Fallback: find English row
      const englishRow = allDims.find(
        (d) =>
          ((d as any).dimension_key ?? d.id) === dimKey &&
          (d as any).language === "en",
      );

      if (englishRow) {
        return dimensionAssessmentRepository.getDimensionWithStates(englishRow.id, "en");
      }

      // Last resort: use the original dimensionId
      return dimensionAssessmentRepository.getDimensionWithStates(dimensionId, lang);
    },
    enabled: !!dimensionId,
  });
};
