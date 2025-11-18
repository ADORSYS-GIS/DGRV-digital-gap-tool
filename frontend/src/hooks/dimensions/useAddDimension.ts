import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ICreateDimensionRequest, IDimension } from "@/types/dimension";
import { SyncStatus } from "@/types/sync";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const useAddDimension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: (dimension: ICreateDimensionRequest) =>
      dimensionRepository.add(dimension),
    onMutate: async (newDimension) => {
      await queryClient.cancelQueries({ queryKey: ["dimensions"] });
      const previousDimensions =
        queryClient.getQueryData<IDimension[]>(["dimensions"]) ?? [];

      const optimisticDimension: IDimension = {
        id: `temp-${Date.now()}`,
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

      return { previousDimensions };
    },
    onSuccess: () => {
      toast.success("Dimension added and will sync when online");
      queryClient.invalidateQueries({ queryKey: ["dimensions"] });
    },
    onError: (error: Error, _, context) => {
      if (context?.previousDimensions) {
        queryClient.setQueryData(["dimensions"], context.previousDimensions);
      }
      toast.error(`Failed to add dimension: ${error.message}`);
    },
  });
};
