import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";

export function useDeleteCooperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cooperationRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cooperations"] });
    },
  });
}
