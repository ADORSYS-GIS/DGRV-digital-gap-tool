import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IDimension } from "@/types/dimension";
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
    onSuccess: () => {
      toast.success("Dimension updated successfully");
      queryClient.invalidateQueries({ queryKey: ["dimensions"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update dimension: ${error.message}`);
    },
  });
};
