import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";
import { toast } from "sonner";
import { IRecommendation } from "@/types/recommendation";

export function useDeleteRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await recommendationRepository.delete(id);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["recommendations"] });
      const previousRecommendations =
        queryClient.getQueryData<IRecommendation[]>(["recommendations"]) ?? [];

      queryClient.setQueryData<IRecommendation[]>(
        ["recommendations"],
        (old = []) =>
          old.filter((r) => r.id !== id && r.recommendation_id !== id),
      );

      return { previousRecommendations };
    },
    onSuccess: () => {
      toast.success("Recommendation deleted successfully");
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(
        ["recommendations"],
        context?.previousRecommendations,
      );
      toast.error(`Failed to delete recommendation: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}
