import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import { IDigitalisationLevel } from "@/types/digitalisationLevel";
import { toast } from "sonner";

interface DeleteDigitalisationLevelVariables {
  dimensionId: string;
  levelId: string;
}

export const useDeleteDigitalisationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    DeleteDigitalisationLevelVariables,
    { previousLevels: IDigitalisationLevel[] | undefined }
  >({
    mutationFn: async ({ levelId }: DeleteDigitalisationLevelVariables) => {
      await digitalisationLevelRepository.delete(levelId);
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
    onSuccess: () => {
      toast.success("Level deleted successfully");
    },
    onError: (err, deletedLevel, context) => {
      if (context?.previousLevels) {
        queryClient.setQueryData(
          ["digitalisationLevels", deletedLevel.dimensionId],
          context.previousLevels,
        );
      }
      toast.error(`Failed to delete level: ${err.message}`);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["digitalisationLevels", variables.dimensionId],
      });
    },
  });
};
