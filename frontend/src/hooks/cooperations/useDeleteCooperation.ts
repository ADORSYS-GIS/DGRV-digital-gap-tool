import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { Cooperation } from "@/types/cooperation";

export const useDeleteCooperation = (organizationId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      cooperationRepository.delete(id, organizationId),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["cooperations"] });
      const previousCooperations = queryClient.getQueryData<Cooperation[]>([
        "cooperations",
      ]);
      queryClient.setQueryData<Cooperation[]>(
        ["cooperations"],
        (old) => old?.filter((coop) => coop.id !== id) || [],
      );
      return { previousCooperations };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["cooperations"], context?.previousCooperations);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cooperations"] });
    },
  });
};
