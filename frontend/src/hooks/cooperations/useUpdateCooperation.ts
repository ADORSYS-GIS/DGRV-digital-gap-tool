import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { Cooperation } from "@/types/cooperation";

export const useUpdateCooperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cooperation: Cooperation) =>
      cooperationRepository.update(cooperation.id, cooperation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cooperations"] });
    },
  });
};
