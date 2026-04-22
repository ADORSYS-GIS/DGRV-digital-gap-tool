import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { IDigitalisationGap } from "@/types/digitalisationGap";
import { useQuery } from "@tanstack/react-query";

import { useTranslation } from "react-i18next";

export const useDigitalisationGap = (gapId: string) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";

  return useQuery<IDigitalisationGap | undefined, Error>({
    queryKey: ["digitalisationGap", gapId, lang],
    queryFn: () => digitalisationGapRepository.getById(gapId, lang),
    enabled: !!gapId,
    networkMode: "always",
  });
};
