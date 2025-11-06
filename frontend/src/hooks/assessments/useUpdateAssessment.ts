import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { Assessment } from "@/types/assessment";

export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assessment: Assessment) => assessmentRepository.update(assessment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
};