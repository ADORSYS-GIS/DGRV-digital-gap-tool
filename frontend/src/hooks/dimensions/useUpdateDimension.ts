import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IDimension } from "@/types/dimension";
import { SyncStatus } from "@/types/sync";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const useUpdateDimension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dimension,
    }: {
      id: string;
      dimension: Partial<IDimension>;
    }) => {
      return dimensionRepository.update(id, dimension);
    },
    onMutate: async ({ id, dimension }) => {
      await queryClient.cancelQueries({ queryKey: ["dimensions"] });
      const previousDimensions =
        queryClient.getQueryData<IDimension[]>(["dimensions"]) ?? [];

      queryClient.setQueryData<IDimension[]>(["dimensions"], (old = []) =>
        old.map((d) =>
          d.id === id
            ? { ...d, ...dimension, syncStatus: SyncStatus.PENDING }
            : d,
        ),
      );

      return { previousDimensions };
    },
    onSuccess: () => {
      toast.success("Dimension updated successfully");
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(["dimensions"], context?.previousDimensions);
      toast.error(`Failed to update dimension: ${error.message}`);
    },
  });
};
