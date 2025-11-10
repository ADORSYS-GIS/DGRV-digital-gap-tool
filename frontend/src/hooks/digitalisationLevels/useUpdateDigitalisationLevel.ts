import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import {
  ICreateCurrentStateRequest,
  ICreateDesiredStateRequest,
  IDigitalisationLevel,
  LevelType,
} from "@/types/digitalisationLevel";

interface UpdateDigitalisationLevelVariables {
  dimensionId: string;
  levelId: string;
  levelType: LevelType;
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
      dimensionId,
      levelId,
      levelType,
      changes,
    }: UpdateDigitalisationLevelVariables) => {
      if (levelType === "current") {
        await digitalisationLevelRepository.updateCurrentState(
          dimensionId,
          levelId,
          changes as Partial<ICreateCurrentStateRequest>,
        );
      } else {
        await digitalisationLevelRepository.updateDesiredState(
          dimensionId,
          levelId,
          changes as Partial<ICreateDesiredStateRequest>,
        );
      }
    },
    onMutate: async (updatedLevel) => {
      const queryKey = ["digitalisationLevels", updatedLevel.dimensionId];
      await queryClient.cancelQueries({ queryKey });

      const previousLevels =
        queryClient.getQueryData<IDigitalisationLevel[]>(queryKey);

      if (previousLevels) {
        queryClient.setQueryData<IDigitalisationLevel[]>(
          queryKey,
          previousLevels.map((level) =>
            level.id === updatedLevel.levelId
              ? { ...level, ...updatedLevel.changes }
              : level,
          ),
        );
      }

      return { previousLevels };
    },
    onError: (err, updatedLevel, context) => {
      if (context?.previousLevels) {
        queryClient.setQueryData(
          ["digitalisationLevels", updatedLevel.dimensionId],
          context.previousLevels,
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["digitalisationLevels", variables.dimensionId],
      });
    },
  });
};
