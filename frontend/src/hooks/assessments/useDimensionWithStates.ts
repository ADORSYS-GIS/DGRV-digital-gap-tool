import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";
import { IDimensionWithStates } from "@/types/dimension";

export const useDimensionWithStates = (dimensionId?: string) => {
  const { i18n } = useTranslation();
  // Normalize language code — strip region suffix (e.g. "fr-FR" → "fr")
  const lang = (i18n.language ?? 'en').split('-')[0];

  return useQuery<IDimensionWithStates>({
    queryKey: ["dimensionWithStates", dimensionId, lang],
    queryFn: async () => {
      if (!dimensionId) throw new Error("Dimension ID is required");
      return dimensionAssessmentRepository.getDimensionWithStates(dimensionId, lang);
    },
    enabled: !!dimensionId,
    // Always refetch when language changes
    staleTime: 0,
  });
};
