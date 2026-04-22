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
    onSuccess: (_, variables) => {
      toast.success("Level deleted successfully");
      // Invalidate all language variants — prefix match covers ["digitalisationLevels", dimensionId, "fr"] etc.
      queryClient.invalidateQueries({
        queryKey: ["digitalisationLevels", variables.dimensionId],
      });
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete level: ${err.message}`);
    },
  });
};
