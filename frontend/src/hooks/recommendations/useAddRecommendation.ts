import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ICreateRecommendationRequest, IRecommendation } from "@/types/recommendation";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";

export const useAddRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation<IRecommendation, Error, ICreateRecommendationRequest>({
    mutationFn: (recommendation) => recommendationRepository.add(recommendation),
    onSuccess: () => {
      toast.success("Recommendation added successfully");
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add recommendation: ${error.message}`);
    },
  });
};
