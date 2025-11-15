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
      // Invalidate and refetch the recommendations query
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      toast.success("Recommendation deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Error deleting recommendation:", error);
      toast.error("Failed to delete recommendation");
    },
  });
}
