import { useQuery } from "@tanstack/react-query";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";

export const useDigitalisationLevels = (dimensionId: string) => {
  return useQuery({
    queryKey: ["digitalisationLevels", dimensionId],
    queryFn: () => digitalisationLevelRepository.getByDimensionId(dimensionId),
    enabled: !!dimensionId,
  });
};
