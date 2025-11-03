import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/services/db";

export const useDeleteDimension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await db.transaction("rw", db.dimensions, db.sync_queue, async () => {
        await db.sync_queue.add({
          entity: "dimension",
          action: "delete",
          payload: { id },
        });
        await db.dimensions.delete(id);
      });
    },
    onSuccess: () => {
      toast.success("Dimension deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["dimensions"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete dimension: ${error.message}`);
    },
  });
};
