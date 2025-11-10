import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { AddDigitalisationGapPayload } from "@/types/digitalisationGap";
import { toast } from "sonner";

export const useAddDigitalisationGap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddDigitalisationGapPayload) =>
      digitalisationGapRepository.addDigitalisationGap(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
      toast.success("Digitalisation gap added successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to add digitalisation gap: ${error.message}`);
    },
  });
};
