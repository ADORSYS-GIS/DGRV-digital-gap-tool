import { useQuery } from "@tanstack/react-query";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";
import { IDimensionWithStates } from "@/types/dimension";

export const useDimensionWithStates = (dimensionId?: string) => {
  return useQuery({
    queryKey: ["dimensionWithStates", dimensionId],
    queryFn: () => {
      if (!dimensionId) {
        throw new Error("Dimension ID is required");
      }
      return dimensionAssessmentRepository.getDimensionWithStates(dimensionId);
    },
    enabled: !!dimensionId,
  });
};
