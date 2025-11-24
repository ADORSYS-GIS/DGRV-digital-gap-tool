import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { Cooperation } from "@/types/cooperation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAddCooperation = (organizationId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cooperation: Omit<Cooperation, "id" | "syncStatus">) =>
      cooperationRepository.add(cooperation, organizationId),
    onMutate: async (newCooperation) => {
      await queryClient.cancelQueries({ queryKey: ["cooperations"] });
      const previousCooperations = queryClient.getQueryData<Cooperation[]>([
        "cooperations",
      ]);
      queryClient.setQueryData<Cooperation[]>(["cooperations"], (old) =>
        old
          ? [
              ...old,
              {
                ...newCooperation,
                id: "temp-id",
                syncStatus: "new",
                domains: [],
              },
            ]
          : [],
      );
      return { previousCooperations };
    },
    onError: (err, newCooperation, context) => {
      queryClient.setQueryData(["cooperations"], context?.previousCooperations);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cooperations"] });
    },
  });
};
