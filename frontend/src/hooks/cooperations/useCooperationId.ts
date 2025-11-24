import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authService } from "@/services/shared/authService";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";

export const useCooperationId = (): string | undefined => {
  const params = useParams<{ cooperationId?: string }>();
  const [cooperationId, setCooperationId] = useState<string | undefined>(
    params.cooperationId,
  );

  useEffect(() => {
    const resolveCooperationId = async () => {
      // If we already have a cooperationId from URL params, use it
      if (params.cooperationId) {
        setCooperationId(params.cooperationId);
        return;
      }

      try {
        // Get the cooperation path from the auth token
        const cooperationPath = authService.getCooperationPath();
        if (!cooperationPath) {
          console.warn("No cooperation path found in token");
          return;
        }

        // Find the cooperation by path in IndexedDB
        console.log("Looking for cooperation with path:", cooperationPath);
        const allCooperations = await cooperationRepository.getAll();
        console.log("All cooperations in IndexedDB:", allCooperations);

        const cooperation = allCooperations.find((c) => {
          const pathMatch = c.path === cooperationPath;
          const idMatch = c.id === cooperationPath;
          console.log(
            `Cooperation ${c.id}: path='${c.path}' (match: ${pathMatch}), id='${c.id}' (match: ${idMatch})`,
          );
          return pathMatch || idMatch;
        });

        if (cooperation) {
          console.log("Found matching cooperation:", cooperation);
          setCooperationId(cooperation.id);
        } else {
          console.warn(`No cooperation found with path: ${cooperationPath}`);
          console.warn(
            "Available cooperation paths:",
            allCooperations.map((c) => c.path),
          );
        }
      } catch (error) {
        console.error("Error resolving cooperation ID:", error);
      }
    };

    resolveCooperationId();
  }, [params.cooperationId]);

  return cooperationId;
};
