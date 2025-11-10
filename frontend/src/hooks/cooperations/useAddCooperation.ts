import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { Cooperation } from "@/types/cooperation";

export const useAddCooperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      cooperation: Omit<Cooperation, "id" | "syncStatus">,
    ) => {
      const newCooperation: Cooperation = {
        ...cooperation,
        id: crypto.randomUUID(),
        syncStatus: "new",
      };
      return cooperationRepository.add(newCooperation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cooperations"] });
    },
  });
};
