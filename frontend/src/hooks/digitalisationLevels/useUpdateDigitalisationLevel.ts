import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DigitalisationLevel } from "@/types/digitalisationLevel";
import { db } from "@/services/db";

export const useUpdateDigitalisationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      level,
    }: {
      id: string;
      level: Partial<DigitalisationLevel>;
    }) => {
      const levelToUpdate: Partial<DigitalisationLevel> = {
        ...level,
        syncStatus: "pending",
        lastModified: new Date().toISOString(),
      };

      await db.transaction(
        "rw",
        db.digitalisationLevels,
        db.sync_queue,
        async () => {
          await db.digitalisationLevels.update(id, levelToUpdate);
          await db.sync_queue.add({
            entity: "dimensionLevel",
            action: "update",
            payload: { id, ...levelToUpdate },
          });
        },
      );
    },
    onSuccess: () => {
      toast.success("Digitalisation level updated successfully");
      queryClient.invalidateQueries({ queryKey: ["digitalisationLevels"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update digitalisation level: ${error.message}`);
    },
  });
};
