import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";

export const useRecommendations = (langOverride?: string) => {
  const { i18n } = useTranslation();
  const lang = langOverride ?? i18n.language;

  return useQuery({
    queryKey: ["recommendations", lang],
    queryFn: () => recommendationRepository.getAll(lang),
    networkMode: "always",
  });
};
