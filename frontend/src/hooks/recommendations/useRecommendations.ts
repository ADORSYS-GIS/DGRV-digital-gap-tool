import { useQuery } from "@tanstack/react-query";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";

export const useRecommendations = () => {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: () => recommendationRepository.getAll(),
  });
};
