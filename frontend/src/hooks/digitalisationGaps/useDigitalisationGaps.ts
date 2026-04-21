import { useQueries } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { IDigitalisationGap } from "@/types/digitalisationGap";
import { IDimension } from "@/types/dimension";

export const useDigitalisationGaps = (langOverride?: string) => {
  const { i18n } = useTranslation();
  const lang = langOverride ?? i18n.language;

  const results = useQueries({
    queries: [
      {
        queryKey: ["digitalisationGaps", lang],
        queryFn: () => digitalisationGapRepository.getAll(lang),
      },
      // Always fetch English dimensions for name lookup — ensures names show
      // correctly regardless of the current UI language
      {
        queryKey: ["dimensions", "en"],
        queryFn: () => dimensionRepository.getAll("en"),
      },
    ],
  });

  const digitalisationGaps = results[0].data as IDigitalisationGap[] | undefined;
  const dimensions = results[1].data as IDimension[] | undefined;

  const isLoading = results.some((query) => query.isLoading);
  const isError = results.some((query) => query.isError);
  const error = results.find((query) => query.isError)?.error;

  const data =
    digitalisationGaps && dimensions
      ? digitalisationGaps.map((gap) => {
          // Match by dimension_key first (cross-language), fall back to dimension_id
          const gapDimKey = (gap as any).dimension_key ?? gap.dimensionId;
          const dimension = dimensions.find(
            (d) => (d as any).dimension_key === gapDimKey || d.id === gap.dimensionId,
          );
          return {
            ...gap,
            dimensionName: dimension?.name || "Unknown Dimension",
          };
        })
      : [];

  return { data, isLoading, isError, error };
};
