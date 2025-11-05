import { useState } from "react";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";
import { Cooperation } from "@/types/cooperation";

export const useAddCooperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addCooperation = async (
    cooperation: Omit<Cooperation, "id" | "syncStatus">,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const newCooperation: Cooperation = {
        ...cooperation,
        id: crypto.randomUUID(),
        syncStatus: "new",
      };
      await cooperationRepository.add(newCooperation);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to add cooperation"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { addCooperation, isLoading, error };
};
