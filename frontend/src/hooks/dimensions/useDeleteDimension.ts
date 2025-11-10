import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IDimension } from "@/types/dimension";
import { toast } from "sonner";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const useDeleteDimension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return dimensionRepository.delete(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["dimensions"] });
      const previousDimensions =
        queryClient.getQueryData<IDimension[]>(["dimensions"]) ?? [];

      queryClient.setQueryData<IDimension[]>(["dimensions"], (old = []) =>
        old.filter((d) => d.id !== id),
      );

      return { previousDimensions };
    },
    onSuccess: () => {
      toast.success("Dimension deleted successfully");
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(["dimensions"], context?.previousDimensions);
      toast.error(`Failed to delete dimension: ${error.message}`);
    },
  });
};
