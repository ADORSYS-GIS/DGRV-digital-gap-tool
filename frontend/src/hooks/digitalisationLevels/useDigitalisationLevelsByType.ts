import { useQuery } from "@tanstack/react-query";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import { LevelType } from "@/types/digitalisationLevel";

export const useDigitalisationLevelsByType = (dimensionId: string, levelType: LevelType) => {
  return useQuery({
    queryKey: ["digitalisationLevels", dimensionId, levelType],
    queryFn: () => digitalisationLevelRepository.getByDimensionIdAndType(dimensionId, levelType),
    enabled: !!dimensionId && !!levelType,
  });
};