import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import { toast } from "sonner";

interface DeleteDigitalisationLevelVariables {
  dimensionId: string;
  levelId: string;
}

export const useDeleteDigitalisationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteDigitalisationLevelVariables>({
    mutationFn: ({ levelId }) => digitalisationLevelRepository.delete(levelId),
    onSuccess: () => {
      toast.success("Level deleted successfully");
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
    onError: (err: Error) => {
      toast.error(`Failed to delete level: ${err.message}`);
    },
  });
};
