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
      // Also fetch English gaps to use as fallback if translated gap missing
      {
        queryKey: ["digitalisationGaps", "en"],
        queryFn: () => digitalisationGapRepository.getAll("en"),
      },
      // Always fetch English dimensions for name lookup — ensures names show
      // correctly regardless of the current UI language
      {
        queryKey: ["dimensions", "en"],
        queryFn: () => dimensionRepository.getAll("en"),
      },
    ],
  });

  const localisedGaps = results[0].data as IDigitalisationGap[] | undefined;
  const englishGaps = results[1].data as IDigitalisationGap[] | undefined;
  const dimensions = results[2].data as IDimension[] | undefined;

  const isLoading = results.some((query) => query.isLoading);
  const isError = results.some((query) => query.isError);
  const error = results.find((query) => query.isError)?.error;

  const combinedGaps: IDigitalisationGap[] = [];
  if (englishGaps) combinedGaps.push(...englishGaps);
  if (localisedGaps) {
    for (const g of localisedGaps) {
      const gKey = (g as any).dimension_key ?? g.dimensionId;
      const existingIdx = combinedGaps.findIndex((cg) => {
        const cgKey = (cg as any).dimension_key ?? cg.dimensionId;
        return cgKey === gKey && String(cg.gap_severity).toUpperCase() === String(g.gap_severity).toUpperCase();
      });
      if (existingIdx !== -1) {
        combinedGaps[existingIdx] = g;
      } else {
        combinedGaps.push(g);
      }
    }
  }

  const data = dimensions
    ? combinedGaps.map((gap) => {
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
