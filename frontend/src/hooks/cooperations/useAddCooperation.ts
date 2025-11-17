import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { Cooperation } from "@/types/cooperation";

export const useAddCooperation = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: addCooperation,
    isLoading,
    error,
  } = useMutation<Cooperation, Error, Omit<Cooperation, "id" | "syncStatus">>({
    mutationFn: async (cooperation) => {
      const newCooperation: Cooperation = {
        ...cooperation,
        id: crypto.randomUUID(),
        syncStatus: "new",
      };
      await cooperationRepository.add(newCooperation);
      return newCooperation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cooperations"] });
    },
  });

  return { addCooperation, isLoading, error };
};
