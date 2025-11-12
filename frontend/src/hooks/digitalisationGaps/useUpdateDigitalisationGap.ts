import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import {
  IDigitalisationGapWithDimension,
  UpdateDigitalisationGapPayload,
} from "@/types/digitalisationGap";
import { toast } from "sonner";

export const useUpdateDigitalisationGap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...changes }: UpdateDigitalisationGapPayload) =>
      digitalisationGapRepository.update(id, changes),
    onMutate: async (updatedGap) => {
      await queryClient.cancelQueries({ queryKey: ["digitalisationGaps"] });
      const previousGaps =
        queryClient.getQueryData<IDigitalisationGapWithDimension[]>([
          "digitalisationGaps",
        ]) || [];
      queryClient.setQueryData(
        ["digitalisationGaps"],
        previousGaps.map((gap) =>
          gap.id === updatedGap.id ? { ...gap, ...updatedGap } : gap,
        ),
      );
      return { previousGaps };
    },
    onSuccess: () => {
      toast.success("Digitalisation gap updated successfully.");
    },
    onError: (err, updatedGap, context) => {
      if (context?.previousGaps) {
        queryClient.setQueryData(["digitalisationGaps"], context.previousGaps);
      }
      toast.error(`Failed to update digitalisation gap: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
    },
  });
};
