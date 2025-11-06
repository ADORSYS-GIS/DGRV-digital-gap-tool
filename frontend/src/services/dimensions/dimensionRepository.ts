import { getDimension, listDimensions } from "@/openapi-client/services.gen"; // Import API functions
import { ICreateDimensionRequest, IDimension } from "@/types/dimension";
import { SyncStatus } from "@/types/sync/index";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { syncService } from "../sync/syncService"; // Import syncService

export const dimensionRepository = {
  getAll: async (): Promise<IDimension[]> => {
    // Always try to fetch from backend first if online, then update local DB
    try {
      // Check if online (a simple check, can be more sophisticated)
      if (navigator.onLine) {
        const backendDimensions = await listDimensions({});
        if (backendDimensions.data) {
          // Clear existing and bulk add new dimensions from backend
          await db.dimensions.clear();
          const syncedDimensions = backendDimensions.data.items.map((d) => ({
            ...d,
            id: d.dimension_id, // Map backend ID to local ID
            syncStatus: SyncStatus.SYNCED,
            lastError: "", // Ensure lastError is a string
          }));
          await db.dimensions.bulkAdd(syncedDimensions);
          console.log("Dimensions fetched from backend and synced to IndexedDB.");
        }
      }
    } catch (error) {
      console.error("Failed to sync all dimensions from backend:", error);
      // Fallback to local data if backend sync fails
    }
    return db.dimensions.toArray(); // Always read from local DB
  },
  getById: async (id: string): Promise<IDimension | undefined> => {
    let localDimension = await db.dimensions.get(id);

    try {
      if (navigator.onLine) {
        const backendDimension = await getDimension({ id });
        if (backendDimension.data) {
          const syncedDimension: IDimension = {
            ...backendDimension.data,
            id: backendDimension.data.dimension_id, // Map backend ID to local ID
            syncStatus: SyncStatus.SYNCED,
            lastError: "", // Ensure lastError is a string
          };
          await db.dimensions.put(syncedDimension); // Update or add to local DB
          localDimension = syncedDimension; // Use the synced version
          console.log(`Dimension ${id} fetched from backend and synced to IndexedDB.`);
        }
      }
    } catch (error) {
      console.error(`Failed to sync dimension ${id} from backend:`, error);
      // Fallback to local data if backend sync fails
    }
    return localDimension; // Always read from local DB
  },
  add: async (dimension: ICreateDimensionRequest): Promise<IDimension> => {
    const newDimension: IDimension = {
      ...dimension,
      id: dimension.id || uuidv4(),
      syncStatus: SyncStatus.PENDING, // Initially set to PENDING
    };
    await db.dimensions.add(newDimension);
    syncService.addToSyncQueue("Dimension", newDimension.id, "CREATE", newDimension);
    return newDimension;
  },
  bulkAdd: async (dimensions: IDimension[]) => {
    await db.dimensions.bulkAdd(dimensions);
  },
  update: async (id: string, changes: Partial<IDimension>): Promise<void> => {
    const existingDimension = await db.dimensions.get(id);
    if (!existingDimension) {
      console.warn(`Dimension with ID ${id} not found in IndexedDB.`);
      return;
    }

    // Update in IndexedDB with PENDING status
    await db.dimensions.update(id, { ...changes, syncStatus: SyncStatus.PENDING });
    syncService.addToSyncQueue("Dimension", id, "UPDATE", { ...existingDimension, ...changes });
  },
  delete: async (id: string): Promise<void> => {
    const existingDimension = await db.dimensions.get(id);
    if (!existingDimension) {
      console.warn(`Dimension with ID ${id} not found in IndexedDB.`);
      return;
    }

    // Mark as PENDING for deletion in IndexedDB
    await db.dimensions.update(id, { syncStatus: SyncStatus.PENDING });
    syncService.addToSyncQueue("Dimension", id, "DELETE", null);
  },
  markAsSynced: async (offlineId: string, serverId: string): Promise<void> => {
    await db.dimensions.update(offlineId, {
      id: serverId,
      syncStatus: SyncStatus.SYNCED,
      lastError: undefined,
    });
  },
  markAsFailed: (id: string, error: string) =>
    db.dimensions.update(id, { syncStatus: SyncStatus.FAILED, lastError: error }),
};
