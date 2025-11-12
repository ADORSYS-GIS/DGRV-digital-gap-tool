import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import {
  AddDigitalisationGapPayload,
  IDigitalisationGapWithDimension,
} from "@/types/digitalisationGap";
import { IDimension } from "@/types/dimension";
import { SyncStatus } from "@/types/sync";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const useAddDigitalisationGap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddDigitalisationGapPayload) =>
      digitalisationGapRepository.add(payload),
    onMutate: async (newGap) => {
      await queryClient.cancelQueries({ queryKey: ["digitalisationGaps"] });

      const previousGaps =
        queryClient.getQueryData<IDigitalisationGapWithDimension[]>([
          "digitalisationGaps",
        ]) || [];

      const dimensions =
        queryClient.getQueryData<IDimension[]>(["dimensions"]) || [];
      const dimension = dimensions.find((d) => d.id === newGap.dimensionId);

      const optimisticGap: IDigitalisationGapWithDimension = {
        ...newGap,
        id: uuidv4(),
        dimensionName: dimension?.name || "Optimistic Dimension",
        syncStatus: SyncStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["digitalisationGaps"],
        [...previousGaps, optimisticGap],
      );

      return { previousGaps };
    },
    onSuccess: () => {
      toast.success("Digitalisation gap added successfully.");
    },
    onError: (err, newGap, context) => {
      if (context?.previousGaps) {
        queryClient.setQueryData(["digitalisationGaps"], context.previousGaps);
      }
      toast.error(`Failed to add digitalisation gap: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
    },
  });
};
