import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { toast } from "sonner";

export const useDeleteDigitalisationGap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => digitalisationGapRepository.delete(id),
    onSuccess: () => {
      toast.success("Digitalisation gap deleted successfully.");
      // Invalidate all gap queries regardless of lang key
      queryClient.invalidateQueries({ queryKey: ["digitalisationGaps"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete digitalisation gap: ${err.message}`);
    },
  });
};
