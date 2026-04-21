import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const useDigitalisationLevels = (dimensionKeyOrId: string, langOverride?: string) => {
  const { i18n } = useTranslation();
  const lang = langOverride ?? i18n.language;

  return useQuery({
    queryKey: ["digitalisationLevels", dimensionKeyOrId, lang],
    queryFn: async () => {
      // If lang is "all", fetch using the ID directly (admin all-languages view)
      if (lang === "all") {
        return digitalisationLevelRepository.getByDimensionId(dimensionKeyOrId, "all");
      }

      // Try to resolve the language-specific dimension_id from dimension_key + lang
      // First check if we already have a dimension with this key+lang in local DB
      const allDims = await dimensionRepository.getAll("all");
      const matchByKey = allDims.find(
        (d) => (d as any).dimension_key === dimensionKeyOrId && (d as any).language === lang,
      );

      if (matchByKey) {
        return digitalisationLevelRepository.getByDimensionId(matchByKey.id, lang);
      }

      // Fallback: treat the param as a direct dimension_id
      return digitalisationLevelRepository.getByDimensionId(dimensionKeyOrId, lang);
    },
    enabled: !!dimensionKeyOrId,
  });
};
