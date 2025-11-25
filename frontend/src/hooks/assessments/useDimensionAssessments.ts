import { useQuery } from "@tanstack/react-query";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";
import { IDimensionAssessment } from "@/types/dimension";

export const useDimensionAssessments = (assessmentId?: string) => {
  return useQuery<IDimensionAssessment[], Error>({
    queryKey: ["dimensionAssessments", assessmentId],
    queryFn: () => {
      if (!assessmentId) {
        throw new Error("Assessment ID is required");
      }
      return dimensionAssessmentRepository.getByAssessment(assessmentId);
    },
    enabled: !!assessmentId,
  });
};
