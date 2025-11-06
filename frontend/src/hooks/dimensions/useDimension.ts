import { useQuery } from "@tanstack/react-query";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const useDimension = (id: string) => {
  return useQuery({
    queryKey: ["dimension", id],
    queryFn: () => dimensionRepository.getById(id),
    enabled: !!id, // Only run the query if id is provided
  });
};