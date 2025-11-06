import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { Assessment } from "@/types/assessment";

export const useAddAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assessment: Omit<Assessment, "id" | "syncStatus" | "lastModified">) =>
      assessmentRepository.add(assessment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
};