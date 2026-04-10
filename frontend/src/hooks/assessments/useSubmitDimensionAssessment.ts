import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";
import {
  IDimensionAssessment,
  ISubmitDimensionAssessmentRequest,
} from "@/types/dimension";

export const useSubmitDimensionAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IDimensionAssessment,
    Error,
    ISubmitDimensionAssessmentRequest
  >({
    mutationFn: (payload: ISubmitDimensionAssessmentRequest) =>
      dimensionAssessmentRepository.submitAssessment(payload),
    onSuccess: (data, variables) => {
      // Invalidate the dimension assessments list so AssessmentDetailPage
      // immediately reflects the completed state on the dimension cards
      if (variables.assessmentId) {
        queryClient.invalidateQueries({
          queryKey: ["dimensionAssessments", variables.assessmentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["assessmentDetails", variables.assessmentId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["dimensionWithStates", variables.dimensionId],
      });
    },
  });
};
