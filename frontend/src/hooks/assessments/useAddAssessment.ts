import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentRepository } from "../../services/assessments/assessmentRepository";

export const useAddAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assessment: { name: string; dimensionIds: string[] }) =>
      assessmentRepository.add(assessment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
};
