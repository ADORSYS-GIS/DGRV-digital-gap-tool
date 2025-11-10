import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import { IDigitalisationLevel, LevelType } from "@/types/digitalisationLevel";

interface DeleteDigitalisationLevelVariables {
  dimensionId: string;
  levelId: string;
  levelType: LevelType;
}

export const useDeleteDigitalisationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    DeleteDigitalisationLevelVariables,
    { previousLevels: IDigitalisationLevel[] | undefined }
  >({
    mutationFn: async ({
      dimensionId,
      levelId,
      levelType,
    }: DeleteDigitalisationLevelVariables) => {
      if (levelType === "current") {
        await digitalisationLevelRepository.deleteCurrentState(
          dimensionId,
          levelId,
        );
      } else {
        await digitalisationLevelRepository.deleteDesiredState(
          dimensionId,
          levelId,
        );
      }
    },
    onMutate: async (deletedLevel) => {
      const queryKey = ["digitalisationLevels", deletedLevel.dimensionId];
      await queryClient.cancelQueries({ queryKey });

      const previousLevels =
        queryClient.getQueryData<IDigitalisationLevel[]>(queryKey);

      if (previousLevels) {
        queryClient.setQueryData<IDigitalisationLevel[]>(
          queryKey,
          previousLevels.filter((level) => level.id !== deletedLevel.levelId),
        );
      }

      return { previousLevels };
    },
    onError: (err, deletedLevel, context) => {
      if (context?.previousLevels) {
        queryClient.setQueryData(
          ["digitalisationLevels", deletedLevel.dimensionId],
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
