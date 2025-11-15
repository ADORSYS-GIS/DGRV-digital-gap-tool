import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ICreateRecommendationRequest,
  IRecommendation,
} from "@/types/recommendation";
import { SyncStatus } from "@/types/sync";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";

export const useAddRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recommendation: ICreateRecommendationRequest) => {
      return await recommendationRepository.add(recommendation);
    },
    onMutate: async (newRecommendation) => {
      await queryClient.cancelQueries({ queryKey: ["recommendations"] });
      const previousRecommendations =
        queryClient.getQueryData<IRecommendation[]>(["recommendations"]) ?? [];

      // Create recommendation with required fields
      const optimisticRecommendation: IRecommendation = {
        id: `temp-${Date.now()}`,
        recommendation_id: `temp-${Date.now()}`,
        dimension_id: newRecommendation.dimension_id,
        priority: newRecommendation.priority,
        description: newRecommendation.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        syncStatus: SyncStatus.PENDING,
        lastError: "",
      };

      queryClient.setQueryData<IRecommendation[]>(
        ["recommendations"],
        (old = []) => [...old, optimisticRecommendation],
      );

      return { previousRecommendations, optimisticRecommendation };
    },
    onSuccess: (data, _, context) => {
      if (!context?.optimisticRecommendation) return;
      queryClient.setQueryData<IRecommendation[]>(
        ["recommendations"],
        (old = []) =>
          old.map((r) =>
            r.id === context.optimisticRecommendation.id ? data : r,
          ),
      );
      toast.success("Recommendation added successfully");
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(
        ["recommendations"],
        context?.previousRecommendations,
      );
      toast.error(`Failed to add recommendation: ${error.message}`);
    },
  });
};
