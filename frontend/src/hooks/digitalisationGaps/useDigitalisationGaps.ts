import { useQueries } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { IDigitalisationGap } from "@/types/digitalisationGap";
import { IDimension } from "@/types/dimension";

export const useDigitalisationGaps = () => {
  const results = useQueries({
    queries: [
      {
        queryKey: ["digitalisationGaps"],
        queryFn: digitalisationGapRepository.getAll,
      },
      {
        queryKey: ["dimensions"],
        queryFn: dimensionRepository.getAll,
      },
    ],
  });

  const digitalisationGaps = results[0].data as
    | IDigitalisationGap[]
    | undefined;
  const dimensions = results[1].data as IDimension[] | undefined;

  const isLoading = results.some((query) => query.isLoading);
  const isError = results.some((query) => query.isError);
  const error = results.find((query) => query.isError)?.error;

  const data =
    digitalisationGaps && dimensions
      ? digitalisationGaps.map((gap) => {
          const dimension = dimensions.find((d) => d.id === gap.dimensionId);
          return {
            ...gap,
            dimensionName: dimension?.name || "Unknown Dimension",
          };
        })
      : [];

  return { data, isLoading, isError, error };
};
