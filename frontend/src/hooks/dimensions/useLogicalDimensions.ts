/**
 * Fetches dimensions for admin dropdowns — always English, one entry per
 * logical dimension (dimension_key). Used when the admin needs to pick a
 * dimension to attach content to, regardless of language.
 */
import { useQuery } from "@tanstack/react-query";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { useTranslation } from "react-i18next";

export interface ILogicalDimension {
  dimension_key: string;
  name: string;
}

export const useLogicalDimensions = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";

  return useQuery<ILogicalDimension[]>({
    queryKey: ["logicalDimensions", lang],
    queryFn: async () => {
      // Fetch current language dimensions
      const dims = await dimensionRepository.getAll(lang);

      // If language is not English, also fetch English as fallback
      let enDims: any[] = [];
      if (lang !== "en") {
        enDims = await dimensionRepository.getAll("en");
      }

      // Deduplicate and merge, preferring current language
      const seen = new Set<string>();
      const result: ILogicalDimension[] = [];

      // First pass: current language
      dims.forEach((d) => {
        const key = (d as any).dimension_key ?? d.id;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({
            dimension_key: key,
            name: d.name,
          });
        }
      });

      // Second pass: English fallback for missing dimensions
      enDims.forEach((d) => {
        const key = (d as any).dimension_key ?? d.id;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({
            dimension_key: key,
            name: d.name,
          });
        }
      });

      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
