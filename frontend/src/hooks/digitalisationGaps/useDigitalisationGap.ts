import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { IDigitalisationGap } from "@/types/digitalisationGap";
import { useQuery } from "@tanstack/react-query";

export const useDigitalisationGap = (gapId: string) => {
  return useQuery<IDigitalisationGap | undefined, Error>({
    queryKey: ["digitalisationGap", gapId],
    queryFn: () => digitalisationGapRepository.getById(gapId),
    enabled: !!gapId,
  });
};
