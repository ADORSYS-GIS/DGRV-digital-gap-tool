import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import {
  ICreateCurrentStateRequest,
  ICreateDesiredStateRequest,
  IDigitalisationLevel,
  LevelState,
  LevelType,
} from "@/types/digitalisationLevel";
import { v4 as uuidv4 } from "uuid";
import { SyncStatus } from "@/types/sync";

interface AddDigitalisationLevelVariables {
  dimensionId: string;
  levelType: LevelType;
  levelData:
    | Omit<ICreateCurrentStateRequest, "levelType" | "id">
    | Omit<ICreateDesiredStateRequest, "levelType" | "id">;
}

export const useAddDigitalisationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IDigitalisationLevel,
    Error,
    AddDigitalisationLevelVariables,
    { previousLevels: IDigitalisationLevel[] | undefined }
  >({
    mutationFn: async ({
      dimensionId,
      levelType,
      levelData,
    }: AddDigitalisationLevelVariables) => {
      if (levelType === "current") {
        return await digitalisationLevelRepository.addCurrentState(
          dimensionId,
          levelData as ICreateCurrentStateRequest,
        );
      } else {
        return await digitalisationLevelRepository.addDesiredState(
          dimensionId,
          levelData as ICreateDesiredStateRequest,
        );
      }
    },
    onMutate: async (newLevel) => {
      const queryKey = ["digitalisationLevels", newLevel.dimensionId];
      await queryClient.cancelQueries({ queryKey });

      const previousLevels =
        queryClient.getQueryData<IDigitalisationLevel[]>(queryKey);

      const optimisticLevel: IDigitalisationLevel = {
        id: uuidv4(),
        syncStatus: SyncStatus.PENDING,
        dimensionId: newLevel.dimensionId,
        levelType: newLevel.levelType,
        state: newLevel.levelData.score as LevelState,
        description: newLevel.levelData.description ?? null,
        level: newLevel.levelData.level ?? null,
        ...("characteristics" in newLevel.levelData && {
          characteristics: newLevel.levelData.characteristics,
        }),
        ...("success_criteria" in newLevel.levelData && {
          success_criteria: newLevel.levelData.success_criteria,
        }),
        ...("target_date" in newLevel.levelData && {
          target_date: newLevel.levelData.target_date,
        }),
      };

      if (previousLevels) {
        queryClient.setQueryData<IDigitalisationLevel[]>(queryKey, [
          ...previousLevels,
          optimisticLevel,
        ]);
      }

      return { previousLevels };
    },
    onError: (err, newLevel, context) => {
      if (context?.previousLevels) {
        queryClient.setQueryData(
          ["digitalisationLevels", newLevel.dimensionId],
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
