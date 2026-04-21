import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";

export const useDigitalisationLevels = (dimensionId: string, langOverride?: string) => {
  const { i18n } = useTranslation();
  const lang = langOverride ?? i18n.language;

  return useQuery({
    queryKey: ["digitalisationLevels", dimensionId, lang],
    queryFn: () => digitalisationLevelRepository.getByDimensionId(dimensionId, lang),
    enabled: !!dimensionId,
  });
};
