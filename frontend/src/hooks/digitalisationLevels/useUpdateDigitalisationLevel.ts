import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ICreateCurrentStateRequest,
  ICreateDesiredStateRequest,
} from "@/types/digitalisationLevel";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";

interface UpdateDigitalisationLevelVariables {
  levelId: string;
  dimensionId: string;
  changes: Partial<ICreateCurrentStateRequest | ICreateDesiredStateRequest>;
}

export const useUpdateDigitalisationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateDigitalisationLevelVariables>({
    mutationFn: ({ levelId, changes }) =>
      digitalisationLevelRepository.update(levelId, changes),
    onSuccess: () => {
      toast.success("Level updated successfully");
      // Invalidate all digitalisationLevels queries regardless of dimension/lang
      queryClient.invalidateQueries({
        queryKey: ["digitalisationLevels"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["dimensionWithStates"],
        refetchType: "all",
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update level: ${error.message}`);
    },
  });
};
