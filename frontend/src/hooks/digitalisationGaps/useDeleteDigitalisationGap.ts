import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";

export const useDeleteDigitalisationGap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => digitalisationGapRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
    },
  });
};