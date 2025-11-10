import { useQuery } from "@tanstack/react-query";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const useDimensions = () => {
  return useQuery({
    queryKey: ["dimensions"],
    queryFn: dimensionRepository.getAll,
  });
};
