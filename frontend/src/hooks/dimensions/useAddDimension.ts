import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ICreateDimensionRequest } from "@/types/dimension";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const useAddDimension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dimension: ICreateDimensionRequest) => {
      return dimensionRepository.add(dimension);
    },
    onSuccess: () => {
      toast.success("Dimension added successfully");
      queryClient.invalidateQueries({ queryKey: ["dimensions"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add dimension: ${error.message}`);
    },
  });
};
