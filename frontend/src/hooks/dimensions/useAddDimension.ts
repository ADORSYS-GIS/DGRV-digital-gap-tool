import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ICreateDimensionRequest, IDimension } from "@/types/dimension";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const useAddDimension = () => {
  const queryClient = useQueryClient();

  return useMutation<IDimension, Error, ICreateDimensionRequest>({
    networkMode: "always",
    mutationFn: (dimension) => dimensionRepository.add(dimension),
    onSuccess: () => {
      toast.success("Dimension added successfully");
      queryClient.invalidateQueries({ queryKey: ["dimensions"] });
      queryClient.invalidateQueries({ queryKey: ["logicalDimensions"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add dimension: ${error.message}`);
    },
  });
};
