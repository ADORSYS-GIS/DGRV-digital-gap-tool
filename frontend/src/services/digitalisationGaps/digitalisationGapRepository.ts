import { getGap, listGaps } from "@/openapi-client/services.gen";
import {
  AddDigitalisationGapPayload,
  Gap,
  IDigitalisationGap,
  IDigitalisationGapWithDimension,
} from "@/types/digitalisationGap";
import { IDimension } from "@/types/dimension";
import { SyncStatus } from "@/types/sync";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { syncService } from "../sync/syncService";

export const digitalisationGapRepository = {
  getAll: async (): Promise<IDigitalisationGapWithDimension[]> => {
    try {
      if (navigator.onLine) {
        const backendGapsResponse = await listGaps({});
        if (backendGapsResponse.data) {
          const backendGaps = backendGapsResponse.data.items;
          const backendGapIds = new Set(backendGaps.map((d) => d.gap_id));

          const localSyncedGaps = await db.digitalisationGaps
            .where("syncStatus")
            .equals(SyncStatus.SYNCED)
            .toArray();
          const localSyncedGapIds = new Set(localSyncedGaps.map((g) => g.id));

          const gapsToUpsert = backendGaps.map((d) => {
            return {
              id: d.gap_id,
              dimensionId: d.dimension_id,
              gap_severity: d.gap_severity as Gap,
              scope: d.gap_description || "",
              syncStatus: SyncStatus.SYNCED,
              lastError: "",
              createdAt: d.created_at,
              updatedAt: d.updated_at,
            } as IDigitalisationGap;
          });

          const idsToDelete = [...localSyncedGapIds].filter(
            (id) => !backendGapIds.has(id),
          );

          await db.transaction("rw", db.digitalisationGaps, async () => {
            if (gapsToUpsert.length > 0) {
              await db.digitalisationGaps.bulkPut(gapsToUpsert);
            }
            if (idsToDelete.length > 0) {
              await db.digitalisationGaps.bulkDelete(idsToDelete);
            }
          });
        }
      }
    } catch (error) {
      console.error(
        "Failed to sync all digitalisation gaps from backend:",
        error,
      );
    }
    const allGaps = await db.digitalisationGaps.toArray();
    const gaps = allGaps.filter((gap) => !gap.isDeleted);
    const dimensions = await db.dimensions.toArray();
    const dimensionMap = new Map<string, IDimension>(
      dimensions.map((d) => [d.id, d]),
    );

    return gaps.map((gap) => ({
      ...gap,
      dimensionName:
        dimensionMap.get(gap.dimensionId)?.name || "Unknown Dimension",
    }));
  },
  getById: async (id: string): Promise<IDigitalisationGap | undefined> => {
    let localGap = await db.digitalisationGaps.get(id);

    try {
      if (navigator.onLine) {
        const backendGap = await getGap({ id });
        if (backendGap.data) {
          const syncedGap: IDigitalisationGap = {
            id: backendGap.data.gap_id,
            dimensionId: backendGap.data.dimension_id,
            gap_severity: backendGap.data.gap_severity as Gap,
            scope: backendGap.data.gap_description || "",
            syncStatus: SyncStatus.SYNCED,
            lastError: "",
            createdAt: backendGap.data.created_at,
            updatedAt: backendGap.data.updated_at,
          };
          await db.digitalisationGaps.put(syncedGap);
          localGap = syncedGap;
        }
      }
    } catch (error) {
      console.error(
        `Failed to sync digitalisation gap ${id} from backend:`,
        error,
      );
    }
    return localGap;
  },
  add: async (
    payload: AddDigitalisationGapPayload,
  ): Promise<IDigitalisationGap> => {
    const newGap: IDigitalisationGap = {
      ...payload,
      id: uuidv4(),
      syncStatus: SyncStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    };
    await db.digitalisationGaps.add(newGap);
    syncService.addToSyncQueue(
      "DigitalisationGap",
      newGap.id,
      "CREATE",
      newGap,
    );
    return newGap;
  },
  update: async (
    id: string,
    changes: Partial<IDigitalisationGap>,
  ): Promise<void> => {
    const existingGap = await db.digitalisationGaps.get(id);
    if (!existingGap) {
      console.warn(`Digitalisation gap with ID ${id} not found in IndexedDB.`);
      return;
    }

    const updatedData = { ...existingGap, ...changes };

    await db.digitalisationGaps.update(id, {
      ...changes,
      syncStatus: SyncStatus.PENDING,
      updatedAt: new Date().toISOString(),
    });
    syncService.addToSyncQueue("DigitalisationGap", id, "UPDATE", updatedData);
  },
  delete: async (id: string): Promise<void> => {
    const existingGap = await db.digitalisationGaps.get(id);
    if (!existingGap) {
      console.warn(`Digitalisation gap with ID ${id} not found in IndexedDB.`);
      return;
    }

    await db.digitalisationGaps.update(id, {
      isDeleted: true,
      syncStatus: SyncStatus.PENDING,
      updatedAt: new Date().toISOString(),
    });
    syncService.addToSyncQueue("DigitalisationGap", id, "DELETE", null);
  },
  markAsSynced: async (offlineId: string, serverId: string): Promise<void> => {
    const existingGap = await db.digitalisationGaps.get(offlineId);
    if (existingGap) {
      await db.digitalisationGaps.delete(offlineId);
      await db.digitalisationGaps.add({
        ...existingGap,
        id: serverId,
        syncStatus: SyncStatus.SYNCED,
        lastError: "",
      });
    }
  },
  markAsFailed: (id: string, error: string) =>
    db.digitalisationGaps.update(id, {
      syncStatus: SyncStatus.FAILED,
      lastError: error,
    }),
};
