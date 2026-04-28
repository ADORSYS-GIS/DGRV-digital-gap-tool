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
      if (navigator.onLine) {
        const backendDimensions = await listDimensions(lang === 'all' ? {} : { lang });
        if (backendDimensions.data) {
          const localDimensions = await db.dimensions.toArray();
          const localDimensionsMap = new Map(
            localDimensions.map((d) => [`${d.id}-${(d as any).lang || 'en'}`, d]),
          );

          const dimensionsToPut = [];
          for (const beDim of backendDimensions.data.items) {
            const currentLang = (beDim as any).language || (lang === 'all' ? 'en' : lang);
            const localKey = `${beDim.dimension_id}-${currentLang}`;
            const localDim = localDimensionsMap.get(localKey);

            // Only update local if it's not pending sync and has required fields
            if ((!localDim || localDim.syncStatus !== SyncStatus.PENDING) && beDim.dimension_id && currentLang) {
              dimensionsToPut.push({
                ...beDim,
                id: beDim.dimension_id,
                lang: currentLang,
                // Preserve dimension_key if backend omits it (truncated list response)
                dimension_key: beDim.dimension_key || localDim?.dimension_key || null,
                syncStatus: SyncStatus.SYNCED,
                lastError: "",
              });
            }
          }

          if (dimensionsToPut.length > 0) {
            try {
              // Validate all items have required fields before bulk insert
              const validDimensions = dimensionsToPut.filter(dim =>
                dim.id && dim.lang
              );

              if (validDimensions.length > 0) {
                await db.dimensions.bulkPut(validDimensions);
                console.log(`Successfully stored ${validDimensions.length} dimensions`);
              } else {
                console.warn('No valid dimensions to store - all missing required fields');
              }
            } catch (error) {
              console.error("Failed to store dimensions in IndexedDB:", error);
              // Don't throw - continue with local data
            }
          }

          // Cleanup logic for synced items no longer in backend (per language)
          if (lang !== 'all') {
            const backendDimensionIds = new Set(
              backendDimensions.data.items.map((d) => d.dimension_id),
            );
            const idsToDelete: [string, string][] = localDimensions
              .filter(
                (d) =>
                  d.syncStatus !== SyncStatus.PENDING &&
                  (d as any).lang === lang &&
                  !backendDimensionIds.has(d.id),
              )
              .map((d) => [d.id, (d as any).lang as string]);

            if (idsToDelete.length > 0) {
              await db.dimensions.bulkDelete(idsToDelete);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to sync dimensions (${lang}) from backend:`, error);
    }

    if (lang === 'all') {
      return db.dimensions.toArray();
    }
    return db.dimensions.where("lang").equals(lang).toArray();
  },
  getById: async (id: string, lang?: string): Promise<IDimension | undefined> => {
    let localDimension = lang
      ? await db.dimensions.get([id, lang])
      : await db.dimensions.where("id").equals(id).first();

    try {
      if (navigator.onLine) {
        const backendDimension = await getDimension({ id });
        if (backendDimension.data) {
          const currentLang = (backendDimension.data as any).language || lang || "en";
          const syncedDimension: IDimension = {
            ...backendDimension.data,
            id: backendDimension.data.dimension_id,
            lang: currentLang,
            syncStatus: SyncStatus.SYNCED,
            lastError: "",
          };

          // Validate required fields before storing
          if (syncedDimension.id && syncedDimension.lang) {
            try {
              await db.dimensions.put(syncedDimension);
              localDimension = syncedDimension;
              console.log(
                `Dimension ${id} (${currentLang}) fetched from backend and synced to IndexedDB.`,
              );
            } catch (error) {
              console.error(`Failed to store dimension ${id}:`, error);
              // Keep existing local dimension if storage fails
            }
          } else {
            console.error(`Invalid dimension data for ${id}: missing required fields`);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to sync dimension ${id} from backend:`, error);
    }
    return localDimension;
  },
  getByIds: async (ids: string[]): Promise<IDimension[]> => {
    return db.dimensions.where("id").anyOf(ids).toArray();
  },
  add: async (dimension: ICreateDimensionRequest): Promise<IDimension> => {
    // Extract language explicitly — it's on CreateDimensionRequest but not on IDimension
    const dimensionLang = dimension.language ?? "en";
    if (navigator.onLine) {
      const { createDimension } = await import("@/openapi-client/services.gen");
      try {
        const response = await createDimension({
          requestBody: {
            name: dimension.name,
            description: dimension.description ?? null,
            category: dimension.category ?? null,
            weight: dimension.weight ?? null,
            language: dimensionLang,
            dimension_key: (dimension as any).dimension_key ?? undefined,
          },
        });
        const data = response.data;
        if (!data) throw new Error("Failed to create dimension");
        const synced: IDimension = {
          id: data.dimension_id,
          lang: dimensionLang,
          name: dimension.name,
          description: dimension.description ?? null,
          category: dimension.category ?? null,
          weight: dimension.weight ?? null,
          is_active: dimension.is_active ?? null,
          dimension_key: data.dimension_key ?? (dimension as any).dimension_key ?? null,
          syncStatus: SyncStatus.SYNCED,
          lastError: "",
        };

        // Validate required fields for composite key [id+lang]
        if (!synced.id || !synced.lang) {
          console.error("Cannot store dimension: missing id or lang", { id: synced.id, lang: synced.lang });
          // Still return the synced object — it was created on backend
        } else {
          try {
            await db.dimensions.put(synced);
          } catch (error) {
            console.error("Failed to store dimension in IndexedDB:", error);
            // Don't throw - the dimension was created on backend successfully
          }
        }
        return synced;
      } catch (err: any) {
        const status = err?.status ?? err?.response?.status;
        const body = err?.body ?? err?.response?.data ?? {};
        if (status === 409) {
          throw new Error(
            body?.message ??
            "A translation for this dimension in this language already exists."
          );
        }
        throw new Error(body?.message ?? err?.message ?? "Failed to create dimension");
      }
    }

    // Offline: queue for later sync
    const newDimension: IDimension = {
      id: dimension.id || uuidv4(),
      lang: dimensionLang,
      name: dimension.name,
      description: dimension.description ?? null,
      category: dimension.category ?? null,
      weight: dimension.weight ?? null,
      is_active: dimension.is_active ?? null,
      dimension_key: (dimension as any).dimension_key ?? null,
      syncStatus: SyncStatus.PENDING,
      lastError: "",
    };
    await db.dimensions.put(newDimension);
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
    const existingDimension = await db.dimensions.where("id").equals(id).first();
    if (!existingDimension) {
      console.warn(`Dimension with ID ${id} not found in IndexedDB.`);
      return;
    }

    const lang = (existingDimension as any).lang || "en";

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
      await db.dimensions.update([id, lang], { ...changes, syncStatus: SyncStatus.SYNCED });
      return;
    }

    // Offline: queue for later sync
    await db.dimensions.update([id, lang], {
      ...changes,
      syncStatus: SyncStatus.PENDING,
    });
    syncService.addToSyncQueue("Dimension", id, "UPDATE", {
      ...existingDimension,
      ...changes,
    });
  },
  delete: async (id: string): Promise<void> => {
    const existingDimensions = await db.dimensions.where("id").equals(id).toArray();
    if (existingDimensions.length === 0) {
      console.warn(`Dimension with ID ${id} not found in IndexedDB.`);
      return;
    }

    if (navigator.onLine) {
      const { deleteDimension } = await import("@/openapi-client/services.gen");
      await deleteDimension({ id });
      for (const d of existingDimensions) {
        const lang = (d as any).lang || "en";
        await db.dimensions.delete([id, lang]);
      }
      await db.sync_queue.filter((item) => item.entityId === id).delete();
      return;
    }

    // Offline: queue for later sync
    for (const d of existingDimensions) {
      const lang = (d as any).lang || "en";
      await db.dimensions.update([id, lang], { syncStatus: SyncStatus.PENDING });
    }
    syncService.addToSyncQueue("Dimension", id, "DELETE", null);
  },
  markAsSynced: async (offlineId: string, serverId: string): Promise<void> => {
    const existing = await db.dimensions.where("id").equals(offlineId).toArray();
    for (const d of existing) {
      const lang = (d as any).lang || "en";
      await db.dimensions.update([offlineId, lang], {
        id: serverId,
        syncStatus: SyncStatus.SYNCED,
        lastError: "",
      });
    }
  },
  markAsFailed: async (id: string, error: string) => {
    const existing = await db.dimensions.where("id").equals(id).toArray();
    for (const d of existing) {
      const lang = (d as any).lang || "en";
      await db.dimensions.update([id, lang], {
        syncStatus: SyncStatus.FAILED,
        lastError: error,
      });
    }
  },
};
