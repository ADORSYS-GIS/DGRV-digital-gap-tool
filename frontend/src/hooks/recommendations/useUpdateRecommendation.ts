import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  IRecommendation,
  IUpdateRecommendationRequest,
} from "@/types/recommendation";
import { SyncStatus } from "@/types/sync";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";

export const useUpdateRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: IUpdateRecommendationRequest) => {
      return recommendationRepository.update(id, updates);
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ["recommendations"] });
      const previousRecommendations =
        queryClient.getQueryData<IRecommendation[]>(["recommendations"]) ?? [];

      queryClient.setQueryData<IRecommendation[]>(
        ["recommendations"],
        (old = []) =>
          old.map((r) =>
            r.id === id
              ? {
                  ...r,
                  ...updates,
                  updated_at: new Date().toISOString(),
                  syncStatus: SyncStatus.PENDING,
                }
              : r,
          ),
      );

      return { previousRecommendations };
    },
    onSuccess: () => {
      toast.success("Recommendation updated successfully");
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(
        ["recommendations"],
        context?.previousRecommendations,
      );
      toast.error(`Failed to update recommendation: ${error.message}`);
    },
  });
};
