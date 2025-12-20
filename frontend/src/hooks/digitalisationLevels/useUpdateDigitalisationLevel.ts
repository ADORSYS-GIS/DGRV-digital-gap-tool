import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ICreateCurrentStateRequest,
  ICreateDesiredStateRequest,
  IDigitalisationLevel,
} from "@/types/digitalisationLevel";
import { SyncStatus } from "@/types/sync";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";

interface UpdateDigitalisationLevelVariables {
  levelId: string;
  dimensionId: string;
  changes: Partial<ICreateCurrentStateRequest | ICreateDesiredStateRequest>;
}

export const useUpdateDigitalisationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    UpdateDigitalisationLevelVariables,
    { previousLevels: IDigitalisationLevel[] | undefined }
  >({
    mutationFn: async ({
      levelId,
      changes,
    }: UpdateDigitalisationLevelVariables) => {
      await digitalisationLevelRepository.update(levelId, changes);
    },
    onMutate: async (updatedLevel) => {
      const queryKey = ["digitalisationLevels", updatedLevel.dimensionId];
      await queryClient.cancelQueries({ queryKey });

      const previousLevels =
        queryClient.getQueryData<IDigitalisationLevel[]>(queryKey) ?? [];

      queryClient.setQueryData<IDigitalisationLevel[]>(queryKey, (old = []) =>
        old.map((level) =>
          level.id === updatedLevel.levelId
            ? {
                ...level,
                ...updatedLevel.changes,
                syncStatus: SyncStatus.PENDING,
              }
            : level,
        ),
      );

      return { previousLevels };
    },
    onSuccess: () => {
      toast.success("Level updated successfully");
    },
    onError: (error: Error, variables, context) => {
      const queryKey = ["digitalisationLevels", variables.dimensionId];
      queryClient.setQueryData(queryKey, context?.previousLevels);
      toast.error(`Failed to update level: ${error.message}`);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["digitalisationLevels", variables.dimensionId],
      });
    },
  });
};
