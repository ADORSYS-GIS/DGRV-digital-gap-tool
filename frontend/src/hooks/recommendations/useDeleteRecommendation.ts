import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";
import { toast } from "sonner";

export function useDeleteRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await recommendationRepository.delete(id);
    },
    onSuccess: () => {
      toast.success("Recommendation deleted successfully");
      // Invalidate all recommendation queries regardless of lang key
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete recommendation: ${error.message}`);
    },
  });
}
