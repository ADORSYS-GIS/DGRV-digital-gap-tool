import { getDimension, listDimensions } from "@/openapi-client/services.gen"; // Import API functions
import { ICreateDimensionRequest, IDimension } from "@/types/dimension";
import { SyncStatus } from "@/types/sync/index";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { syncService } from "../sync/syncService"; // Import syncService

export const dimensionRepository = {
  getAll: async (lang = 'en'): Promise<IDimension[]> => {
    // Always try to fetch from backend first if online, then update local DB
    try {
      // Check if online (a simple check, can be more sophisticated)
      if (navigator.onLine) {
        const backendDimensions = await listDimensions({ lang });
        if (backendDimensions.data) {
          const localDimensions = await db.dimensions.toArray();
          const localDimensionsMap = new Map(
            localDimensions.map((d) => [d.id, d]),
          );
          const backendDimensionIds = new Set(
            backendDimensions.data.items.map((d) => d.dimension_id),
          );

          const dimensionsToPut = [];
          for (const beDim of backendDimensions.data.items) {
            const localDim = localDimensionsMap.get(beDim.dimension_id);
            // Only update local if it's not pending sync
            if (!localDim || localDim.syncStatus !== SyncStatus.PENDING) {
              dimensionsToPut.push({
                ...beDim,
                id: beDim.dimension_id,
                syncStatus: SyncStatus.SYNCED,
                lastError: "",
              });
            }
          }

          if (dimensionsToPut.length > 0) {
            await db.dimensions.bulkPut(dimensionsToPut);
          }

          const idsToDelete = localDimensions
            .filter(
              (d) =>
                d.syncStatus !== SyncStatus.PENDING &&
                !backendDimensionIds.has(d.id),
            )
            .map((d) => d.id);

          if (idsToDelete.length > 0) {
            await db.dimensions.bulkDelete(idsToDelete);
          }
          console.log(
            "Dimensions fetched from backend and synced to IndexedDB.",
          );
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
          console.log(
            `Dimension ${id} fetched from backend and synced to IndexedDB.`,
          );
        }
      }
    } catch (error) {
      console.error(`Failed to sync dimension ${id} from backend:`, error);
      // Fallback to local data if backend sync fails
    }
    return localDimension; // Always read from local DB
  },
  getByIds: async (ids: string[]): Promise<IDimension[]> => {
    return db.dimensions.where("id").anyOf(ids).toArray();
  },
  add: async (dimension: ICreateDimensionRequest): Promise<IDimension> => {
    if (navigator.onLine) {
      // Call API directly — ensures language and dimension_key are sent correctly
      const { createDimension } = await import("@/openapi-client/services.gen");
      const response = await createDimension({
        requestBody: {
          name: dimension.name,
          description: dimension.description ?? null,
          category: dimension.category ?? null,
          weight: dimension.weight ?? null,
          language: (dimension as any).language ?? "en",
          // Pass dimension_key if provided (linking a translation to an existing dimension)
          dimension_key: (dimension as any).dimension_key ?? undefined,
        },
      });
      const data = response.data;
      if (!data) throw new Error("Failed to create dimension");
      const synced: IDimension = {
        ...dimension,
        id: data.dimension_id,
        syncStatus: SyncStatus.SYNCED,
        // Store dimension_key for future use
        ...(data.dimension_key && { dimension_key: data.dimension_key } as any),
      };
      await db.dimensions.put(synced);
      return synced;
    }

    // Offline: queue for later sync
    const newDimension: IDimension = {
      ...dimension,
      id: dimension.id || uuidv4(),
      syncStatus: SyncStatus.PENDING,
    };
    await db.dimensions.add(newDimension);
    syncService.addToSyncQueue(
      "Dimension",
      newDimension.id,
      "CREATE",
      newDimension,
    );
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

    if (navigator.onLine) {
      const { updateDimension } = await import("@/openapi-client/services.gen");
      await updateDimension({
        id,
        requestBody: {
          name: (changes as any).name ?? existingDimension.name,
          description: (changes as any).description ?? existingDimension.description ?? null,
          category: (changes as any).category ?? existingDimension.category ?? null,
          weight: (changes as any).weight ?? existingDimension.weight ?? null,
          language: (changes as any).language ?? (existingDimension as any).language ?? undefined,
        },
      });
      await db.dimensions.update(id, { ...changes, syncStatus: SyncStatus.SYNCED });
      return;
    }

    // Offline: queue for later sync
    await db.dimensions.update(id, {
      ...changes,
      syncStatus: SyncStatus.PENDING,
    });
    syncService.addToSyncQueue("Dimension", id, "UPDATE", {
      ...existingDimension,
      ...changes,
    });
  },
  delete: async (id: string): Promise<void> => {
    const existingDimension = await db.dimensions.get(id);
    if (!existingDimension) {
      console.warn(`Dimension with ID ${id} not found in IndexedDB.`);
      return;
    }

    if (navigator.onLine) {
      // Call API directly when online
      const { deleteDimension } = await import("@/openapi-client/services.gen");
      await deleteDimension({ id });
      await db.dimensions.delete(id);
      // Clean up any stale sync queue entries
      await db.sync_queue.filter((item) => item.entityId === id).delete();
      return;
    }

    // Offline: queue for later sync
    await db.dimensions.update(id, { syncStatus: SyncStatus.PENDING });
    syncService.addToSyncQueue("Dimension", id, "DELETE", null);
  },
  markAsSynced: async (offlineId: string, serverId: string): Promise<void> => {
    await db.dimensions.update(offlineId, {
      id: serverId,
      syncStatus: SyncStatus.SYNCED,
      lastError: "",
    });
  },
  markAsFailed: (id: string, error: string) =>
    db.dimensions.update(id, {
      syncStatus: SyncStatus.FAILED,
      lastError: error,
    }),
};
