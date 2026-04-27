import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ICreateCurrentStateRequest,
  ICreateDesiredStateRequest,
  IDigitalisationLevel,
  LevelType,
} from "@/types/digitalisationLevel";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";

interface AddDigitalisationLevelVariables {
  dimensionId: string;
  levelType: LevelType;
  levelData: ICreateCurrentStateRequest | ICreateDesiredStateRequest;
}

export const useAddDigitalisationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation<IDigitalisationLevel, Error, AddDigitalisationLevelVariables>({
    mutationFn: ({ dimensionId, levelData, levelType }) =>
      digitalisationLevelRepository.add(dimensionId, levelData, levelType),
    onSuccess: (_, variables) => {
      toast.success("Level added successfully");
      // Invalidate all queries that start with digitalisationLevels — covers all dimension IDs and languages
      queryClient.invalidateQueries({
        queryKey: ["digitalisationLevels"],
        refetchType: "all",
      });
      // Also invalidate dimension-with-states cache used in assessments
      queryClient.invalidateQueries({
        queryKey: ["dimensionWithStates"],
        refetchType: "all",
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add level: ${error.message}`);
    },
  });
};
