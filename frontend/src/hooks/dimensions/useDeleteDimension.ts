import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const useDeleteDimension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return dimensionRepository.delete(id);
    },
    onSuccess: () => {
      toast.success("Dimension deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["dimensions"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete dimension: ${error.message}`);
    },
  });
};
