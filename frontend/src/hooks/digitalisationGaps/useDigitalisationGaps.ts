import { useQuery } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";

export const useDigitalisationGaps = () => {
  return useQuery({
    queryKey: ["digitalisationGaps"],
    queryFn: () => digitalisationGapRepository.getAll(),
  });
};