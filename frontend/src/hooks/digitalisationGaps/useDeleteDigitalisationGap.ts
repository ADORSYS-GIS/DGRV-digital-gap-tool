import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { toast } from "sonner";

export const useDeleteDigitalisationGap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      digitalisationGapRepository.deleteDigitalisationGap(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
      toast.success("Digitalisation gap deleted successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to delete digitalisation gap: ${error.message}`);
    },
  });
};
