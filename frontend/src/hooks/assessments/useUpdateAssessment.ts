import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentRepository } from "../../services/assessments/assessmentRepository";
import { Assessment } from "../../types/assessment";

export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      assessment,
    }: {
      id: string;
      assessment: Partial<Assessment>;
    }) => assessmentRepository.update(id, assessment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}
