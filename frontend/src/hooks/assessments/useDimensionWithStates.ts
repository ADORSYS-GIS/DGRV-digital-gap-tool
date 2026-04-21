import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";
import { IDimensionWithStates } from "@/types/dimension";

export const useDimensionWithStates = (dimensionId?: string) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useQuery<IDimensionWithStates>({
    queryKey: ["dimensionWithStates", dimensionId, lang],
    queryFn: () => {
      if (!dimensionId) {
        throw new Error("Dimension ID is required");
      }
      return dimensionAssessmentRepository.getDimensionWithStates(dimensionId, lang);
    },
    enabled: !!dimensionId,
  });
};
