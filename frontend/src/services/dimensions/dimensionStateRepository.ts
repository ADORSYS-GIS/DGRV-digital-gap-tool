import { db } from "../db";
import { IDimensionState } from "@/types/dimension";
import { IDigitalisationLevel } from "@/types/digitalisationLevel";
import { SyncStatus } from "@/types/sync/index";

export const dimensionStateRepository = {
  getAll: async (): Promise<IDimensionState[]> => {
    let levels = await db.digitalisationLevels.toArray();

    // If IndexedDB is empty, fetch from backend
    if (levels.length === 0 && navigator.onLine) {
      try {
        const { listDimensions, getDimensionWithStates } = await import(
          "@/openapi-client/services.gen"
        );
        const dimsResponse = await listDimensions({});
        const dims = dimsResponse.data?.items ?? [];

        const allLevels: IDigitalisationLevel[] = [];
        for (const dim of dims) {
          try {
            const statesResponse = await getDimensionWithStates({
              id: dim.dimension_id,
            });
            const data = statesResponse.data;
            if (data) {
              for (const cs of (data as any).current_states ?? []) {
                // Ensure required fields for composite key [id+lang] are present
                if (cs.current_state_id) {
                  allLevels.push({
                    id: cs.current_state_id,
                    lang: "en", // Add required lang field for composite key
                    dimensionId: dim.dimension_id,
                    levelType: "current",
                    state: cs.score as number,
                    level: cs.level ?? cs.score ?? 0,
                    title: cs.title,
                    description: cs.description ?? null,
                    syncStatus: SyncStatus.SYNCED,
                    lastError: "",
                  });
                }
              }
              for (const ds of (data as any).desired_states ?? []) {
                // Ensure required fields for composite key [id+lang] are present
                if (ds.desired_state_id) {
                  allLevels.push({
                    id: ds.desired_state_id,
                    lang: "en", // Add required lang field for composite key
                    dimensionId: dim.dimension_id,
                    levelType: "desired",
                    state: typeof ds.score === 'number' ? ds.score : 0,
                    level: null,
                    title: ds.title,
                    description: ds.description ?? null,
                    syncStatus: SyncStatus.SYNCED,
                    lastError: "",
                  });
                }
              }
            }
          } catch (error) {
            console.error(`Failed to fetch states for dimension ${dim.dimension_id}:`, error);
            // skip this dimension
          }
        }

        if (allLevels.length > 0) {
          try {
            // Validate all items have required fields before bulk insert
            const validLevels = allLevels.filter(level => 
              level.id && level.lang && level.dimensionId
            );
            
            if (validLevels.length > 0) {
              await db.digitalisationLevels.bulkPut(validLevels);
              levels = validLevels;
              console.log(`Successfully stored ${validLevels.length} digitalisation levels`);
            } else {
              console.warn('No valid levels to store - all missing required fields');
            }
          } catch (error) {
            console.error("Failed to store digitalisation levels in IndexedDB:", error);
            // Don't throw - return empty array to prevent app crash
            levels = [];
          }
        }
      } catch (error) {
        console.error("Failed to fetch dimension states from backend:", error);
      }
    }

    return levels.map((level: IDigitalisationLevel) => ({
      id: level.id,
      dimensionId: level.dimensionId,
      // Use state (numeric score) as the level value for the chart
      level: typeof level.state === 'number' && !isNaN(level.state) ? level.state : 0,
      name: level.title,
      description: level.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },
};
