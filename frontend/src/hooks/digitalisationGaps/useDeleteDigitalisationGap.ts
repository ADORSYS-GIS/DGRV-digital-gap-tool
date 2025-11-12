import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { toast } from "sonner";
import { IDigitalisationGapWithDimension } from "@/types/digitalisationGap";

export const useDeleteDigitalisationGap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => digitalisationGapRepository.delete(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["digitalisationGaps"] });
      const previousGaps =
        queryClient.getQueryData<IDigitalisationGapWithDimension[]>([
          "digitalisationGaps",
        ]) || [];
      queryClient.setQueryData(
        ["digitalisationGaps"],
        previousGaps.filter((gap) => gap.id !== deletedId),
      );
      return { previousGaps };
    },
    onSuccess: () => {
      toast.success("Digitalisation gap deleted successfully.");
    },
    onError: (err, deletedId, context) => {
      if (context?.previousGaps) {
        queryClient.setQueryData(["digitalisationGaps"], context.previousGaps);
      }
      toast.error(`Failed to delete digitalisation gap: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
    },
  });
};
