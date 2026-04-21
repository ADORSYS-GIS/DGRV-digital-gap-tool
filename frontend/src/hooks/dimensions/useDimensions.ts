import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export const useDimensions = (langOverride?: string) => {
  const { i18n } = useTranslation();
  const lang = langOverride ?? i18n.language;

  return useQuery({
    queryKey: ["dimensions", lang],
    queryFn: () => dimensionRepository.getAll(lang),
  });
};
