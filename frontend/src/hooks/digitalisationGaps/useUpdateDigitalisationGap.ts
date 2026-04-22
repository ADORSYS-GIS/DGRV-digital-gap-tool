import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { UpdateDigitalisationGapPayload } from "@/types/digitalisationGap";
import { toast } from "sonner";

export const useUpdateDigitalisationGap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...changes }: UpdateDigitalisationGapPayload) =>
      digitalisationGapRepository.update(id, changes),
    onSuccess: () => {
      toast.success("Digitalisation gap updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to update digitalisation gap: ${err.message}`);
    },
  });
};
