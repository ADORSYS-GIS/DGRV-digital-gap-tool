import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/services/db";

export const useDeleteDigitalisationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await db.transaction(
        "rw",
        db.digitalisationLevels,
        db.sync_queue,
        async () => {
          await db.sync_queue.add({
            entity: "dimensionLevel",
            action: "delete",
            payload: { id },
          });
          await db.digitalisationLevels.delete(id);
        },
      );
    },
    onSuccess: () => {
      toast.success("Digitalisation level deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["digitalisationLevels"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete digitalisation level: ${error.message}`);
    },
  });
};
