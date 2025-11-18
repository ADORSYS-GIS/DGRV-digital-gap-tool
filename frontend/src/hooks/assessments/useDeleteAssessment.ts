import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentRepository } from "../../services/assessments/assessmentRepository";

export function useDeleteAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assessmentRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}
