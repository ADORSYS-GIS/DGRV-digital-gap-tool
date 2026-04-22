import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { AddDigitalisationGapPayload, IDigitalisationGap } from "@/types/digitalisationGap";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddDigitalisationGap = () => {
  const queryClient = useQueryClient();

  return useMutation<IDigitalisationGap, Error, AddDigitalisationGapPayload>({
    mutationFn: (payload) => digitalisationGapRepository.add(payload),
    onSuccess: () => {
      toast.success("Digitalisation gap added successfully.");
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to add digitalisation gap: ${err.message}`);
    },
  });
};
