import { useQuery } from "@tanstack/react-query";
import { dimensionStateRepository } from "@/services/dimensions/dimensionStateRepository";
import { IDimensionState } from "@/types/dimension";

export const useAllDimensionStates = () => {
  return useQuery<IDimensionState[], Error>({
    queryKey: ["allDimensionStates"],
    queryFn: () => dimensionStateRepository.getAll(),
  });
};
