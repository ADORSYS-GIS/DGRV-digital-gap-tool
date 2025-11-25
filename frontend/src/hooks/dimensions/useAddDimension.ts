import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ICreateDimensionRequest, IDimension } from "@/types/dimension";
import { SyncStatus } from "@/types/sync";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

type MutationContext = {
  previousDimensions: IDimension[];
  optimisticId: number;
};

export const useAddDimension = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IDimension,
    Error,
    ICreateDimensionRequest,
    MutationContext
  >({
    networkMode: "always",
    mutationFn: (dimension: ICreateDimensionRequest) =>
      dimensionRepository.add(dimension),
    onMutate: async (newDimension) => {
      await queryClient.cancelQueries({ queryKey: ["dimensions"] });
      const previousDimensions =
        queryClient.getQueryData<IDimension[]>(["dimensions"]) ?? [];

      const optimisticId = Date.now();
      const optimisticDimension: IDimension = {
        id: `temp-${optimisticId}`,
        ...newDimension,
        description: newDimension.description ?? null,
        category: newDimension.category ?? null,
        weight: newDimension.weight ?? null,
        is_active: newDimension.is_active ?? true,
        syncStatus: SyncStatus.PENDING,
      };

      queryClient.setQueryData<IDimension[]>(["dimensions"], (old = []) => [
        ...old,
        optimisticDimension,
      ]);

      return { previousDimensions, optimisticId };
    },
    onSuccess: (data, _variables, context) => {
      toast.success("Dimension added successfully");
      queryClient.setQueryData<IDimension[]>(["dimensions"], (old = []) =>
        old.map((d) => (d.id === `temp-${context.optimisticId}` ? data : d)),
      );
    },
    onError: (error: Error, _, context) => {
      if (context?.previousDimensions) {
        queryClient.setQueryData(["dimensions"], context.previousDimensions);
      }
      toast.error(`Failed to add dimension: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dimensions"] });
    },
  });
};
