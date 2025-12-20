import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ICreateCurrentStateRequest,
  ICreateDesiredStateRequest,
  IDigitalisationLevel,
  LevelState,
  LevelType,
} from "@/types/digitalisationLevel";
import { SyncStatus } from "@/types/sync";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import { v4 as uuidv4 } from "uuid";

interface AddDigitalisationLevelVariables {
  dimensionId: string;
  levelType: LevelType;
  levelData: ICreateCurrentStateRequest | ICreateDesiredStateRequest;
}

export const useAddDigitalisationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IDigitalisationLevel,
    Error,
    AddDigitalisationLevelVariables,
    {
      previousLevels: IDigitalisationLevel[] | undefined;
      optimisticLevel: IDigitalisationLevel;
    }
  >({
    mutationFn: async ({
      dimensionId,
      levelData,
      levelType,
    }: AddDigitalisationLevelVariables) => {
      return await digitalisationLevelRepository.add(
        dimensionId,
        levelData,
        levelType,
      );
    },
    onMutate: async (newLevel) => {
      const queryKey = ["digitalisationLevels", newLevel.dimensionId];
      await queryClient.cancelQueries({ queryKey });

      const previousLevels =
        queryClient.getQueryData<IDigitalisationLevel[]>(queryKey) ?? [];

      const optimisticLevel: IDigitalisationLevel = {
        id: uuidv4(),
        dimensionId: newLevel.dimensionId,
        levelType: newLevel.levelType,
        state: newLevel.levelData.score as LevelState,
        description: newLevel.levelData.description ?? null,
        level: newLevel.levelData.level ?? null,
        syncStatus: SyncStatus.PENDING,
        lastError: "",
      };

      queryClient.setQueryData<IDigitalisationLevel[]>(queryKey, (old = []) => [
        ...old,
        optimisticLevel,
      ]);

      return { previousLevels, optimisticLevel };
    },
    onSuccess: (data, variables, context) => {
      if (!context?.optimisticLevel) return;
      const queryKey = ["digitalisationLevels", variables.dimensionId];
      queryClient.setQueryData<IDigitalisationLevel[]>(queryKey, (old = []) =>
        old.map((level) =>
          level.id === context.optimisticLevel.id ? data : level,
        ),
      );
      toast.success("Level added successfully");
    },
    onError: (error: Error, variables, context) => {
      const queryKey = ["digitalisationLevels", variables.dimensionId];
      queryClient.setQueryData(queryKey, context?.previousLevels);
      toast.error(`Failed to add level: ${error.message}`);
    },
  });
};
