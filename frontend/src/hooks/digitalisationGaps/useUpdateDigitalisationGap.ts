import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { Gap } from "@/types/gap";

export const useUpdateDigitalisationGap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Gap> }) =>
      digitalisationGapRepository.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
    },
  });
};