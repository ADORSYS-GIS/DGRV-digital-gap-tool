import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Dimension } from "@/types/dimension";
import { db } from "@/services/db";

export const useAddDimension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      dimension: Omit<Dimension, "id" | "syncStatus" | "lastModified">,
    ) => {
      const newDimension: Dimension = {
        ...dimension,
        id: uuidv4(),
        syncStatus: "pending",
        lastModified: new Date().toISOString(),
      };

      await db.transaction("rw", db.dimensions, db.sync_queue, async () => {
        await db.dimensions.add(newDimension);
        await db.sync_queue.add({
          entity: "dimension",
          action: "create",
          payload: newDimension,
        });
      });
    },
    onSuccess: () => {
      toast.success("Dimension added successfully");
      queryClient.invalidateQueries({ queryKey: ["dimensions"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add dimension: ${error.message}`);
    },
  });
};
