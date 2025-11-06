import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { Gap } from "@/types/gap";

export const useAddDigitalisationGap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gap: Omit<Gap, "id">) => digitalisationGapRepository.add(gap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
    },
  });
};