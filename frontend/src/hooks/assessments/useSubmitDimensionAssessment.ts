import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";
import { ISubmitDimensionAssessmentRequest } from "@/types/dimension";

export const useSubmitDimensionAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ISubmitDimensionAssessmentRequest) =>
      dimensionAssessmentRepository.submitAssessment(payload),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({
        queryKey: ["dimensionWithStates", variables.dimensionId],
      });

      if (variables.assessmentId) {
        queryClient.invalidateQueries({
          queryKey: ["assessmentDetails", variables.assessmentId],
        });
      }
    },
  });
};
