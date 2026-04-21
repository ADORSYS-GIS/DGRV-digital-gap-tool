/**
 * Fetches dimensions for admin dropdowns — always English, one entry per
 * logical dimension (dimension_key). Used when the admin needs to pick a
 * dimension to attach content to, regardless of language.
 */
import { useQuery } from "@tanstack/react-query";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

export interface ILogicalDimension {
  dimension_key: string;
  name: string;
}

export const useLogicalDimensions = () => {
  return useQuery<ILogicalDimension[]>({
    queryKey: ["logicalDimensions"],
    queryFn: async () => {
      const dims = await dimensionRepository.getAll("en");
      // Deduplicate by dimension_key (in case multiple EN rows exist)
      const seen = new Set<string>();
      return dims
        .filter((d) => {
          const key = (d as any).dimension_key ?? d.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((d) => ({
          dimension_key: (d as any).dimension_key ?? d.id,
          name: d.name,
        }));
    },
  });
};
