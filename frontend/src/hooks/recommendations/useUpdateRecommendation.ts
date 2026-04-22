import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IUpdateRecommendationRequest } from "@/types/recommendation";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";

export const useUpdateRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: IUpdateRecommendationRequest) =>
      recommendationRepository.update(id, updates),
    onSuccess: () => {
      toast.success("Recommendation updated successfully");
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update recommendation: ${error.message}`);
    },
  });
};
