import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dimension } from "@/types/dimension";
import { db } from "@/services/db";

export const useUpdateDimension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dimension,
    }: {
      id: string;
      dimension: Partial<Dimension>;
    }) => {
      const dimensionToUpdate: Partial<Dimension> = {
        ...dimension,
        syncStatus: "pending",
        lastModified: new Date().toISOString(),
      };

      await db.transaction("rw", db.dimensions, db.sync_queue, async () => {
        await db.dimensions.update(id, dimensionToUpdate);
        await db.sync_queue.add({
          entity: "dimension",
          action: "update",
          payload: { id, ...dimensionToUpdate },
        });
      });
    },
    onSuccess: () => {
      toast.success("Dimension updated successfully");
      queryClient.invalidateQueries({ queryKey: ["dimensions"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update dimension: ${error.message}`);
    },
  });
};
