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
    onSuccess: (_, variables) => {
      toast.success("Level updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["digitalisationLevels", variables.dimensionId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update level: ${error.message}`);
    },
  });
};
