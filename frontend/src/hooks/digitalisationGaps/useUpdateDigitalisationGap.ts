import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { UpdateDigitalisationGapPayload } from "@/types/digitalisationGap";
import { toast } from "sonner";

export const useUpdateDigitalisationGap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDigitalisationGapPayload) =>
      digitalisationGapRepository.updateDigitalisationGap(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
      toast.success("Digitalisation gap updated successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to update digitalisation gap: ${error.message}`);
    },
  });
};
