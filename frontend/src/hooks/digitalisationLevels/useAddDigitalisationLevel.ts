import { useMutation, useQueryClient } from "@tanstack/react-query";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import { DigitalisationLevel } from "@/types/digitalisationLevel";
import { db } from "@/services/db";
import { v4 as uuidv4 } from "uuid";

export const useAddDigitalisationLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      levelData: Omit<
        DigitalisationLevel,
        "id" | "syncStatus" | "lastModified"
      >,
    ): Promise<DigitalisationLevel> => {
      const newLevel: DigitalisationLevel = {
        id: uuidv4(),
        ...levelData,
        syncStatus: "pending",
        lastModified: new Date().toISOString(),
      };
      await digitalisationLevelRepository.add(newLevel);
      return newLevel;
    },
    onSuccess: (newLevel) => {
      db.sync_queue.add({
        entity: "dimensionLevel",
        action: "create",
        payload: newLevel,
      });
      queryClient.invalidateQueries({
        queryKey: ["digitalisationLevels", newLevel.dimensionId],
      });
    },
  });
};
