import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { AddAssessmentPayload } from "@/types/assessment";

export const useAddAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assessment: AddAssessmentPayload) =>
      assessmentRepository.add(assessment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
};
