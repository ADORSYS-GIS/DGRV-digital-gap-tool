import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const useDeleteDimension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: async (id: string) => {
      return dimensionRepository.delete(id);
    },
    onSuccess: () => {
      toast.success("Dimension deleted successfully");
      // Invalidate all dimension queries regardless of lang key
      queryClient.invalidateQueries({ queryKey: ["dimensions"] });
      queryClient.invalidateQueries({ queryKey: ["logicalDimensions"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete dimension: ${error.message}`);
    },
  });
};
