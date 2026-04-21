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
  getAll: async (lang = 'en'): Promise<IDigitalisationGapWithDimension[]> => {
    try {
      if (navigator.onLine) {
        // Fetch ALL pages from backend to avoid losing items beyond page 1
        const allBackendGaps: any[] = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
          const backendGapsResponse = await listGaps({
            page: currentPage,
            limit: 100,
            lang,
          });
          if (backendGapsResponse.data) {
            const responseData: any = backendGapsResponse.data as any;
            const paginatedData =
              responseData?.data ?? responseData ?? {};
            const gaps: any[] = Array.isArray(paginatedData)
              ? paginatedData
              : (paginatedData.items ?? responseData?.items ?? []);
            allBackendGaps.push(...gaps);
            totalPages = paginatedData.total_pages ?? 1;
          }
          currentPage++;
        } while (currentPage <= totalPages);

        // Always sync — move cleanup outside length check so stale data
        // is cleared even when backend returns empty (e.g. after DB wipe)
        const localGaps = await db.digitalisationGaps.toArray();
        const backendGapIds = new Set(allBackendGaps.map((d) => d.gap_id));

        if (allBackendGaps.length > 0) {
          const localGapsMap = new Map(localGaps.map((g) => [g.id, g]));

          const gapsToUpsert = allBackendGaps
            .map((d: any) => {
              const localGap = localGapsMap.get(d.gap_id);
              if (localGap && localGap.syncStatus === SyncStatus.PENDING) {
                return null; // Keep local pending changes
              }
              return {
                id: d.gap_id,
                dimensionId: d.dimension_id,
                dimension_key: d.dimension_key,
                gap_severity: d.gap_severity as Gap,
                description: d.gap_description || "",
                language: d.language ?? "en",
                syncStatus: SyncStatus.SYNCED,
                lastError: "",
                createdAt: d.created_at,
                updatedAt: d.updated_at,
              } as IDigitalisationGap;
            })
            .filter((g): g is IDigitalisationGap => g !== null);

          if (gapsToUpsert.length > 0) {
            await db.digitalisationGaps.bulkPut(gapsToUpsert);
          }
        }

        // Always delete stale local items (runs even when backend returns empty)
        const idsToDelete = localGaps
          .filter(
            (g) =>
              g.syncStatus !== SyncStatus.PENDING &&
              g.syncStatus !== SyncStatus.FAILED &&
              !backendGapIds.has(g.id),
          )
          .map((g) => g.id);

        await db.transaction("rw", db.digitalisationGaps, async () => {
          if (idsToDelete.length > 0) {
            await db.digitalisationGaps.bulkDelete(idsToDelete);
          }
        });

        console.log(
          `Digitalisation gaps fetched from backend (${allBackendGaps.length} total) and synced to IndexedDB.`,
        );
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
            description: backendGap.data.gap_description || "",
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
    if (navigator.onLine) {
      const { adminCreateGap } = await import("@/openapi-client/services.gen");
      try {
        const response = await adminCreateGap({
          requestBody: {
            dimension_key: (payload as any).dimensionKey ?? (payload as any).dimension_key ?? payload.dimensionId,
            dimension_id: payload.dimensionId ?? null,
            gap_description: payload.description,
            gap_severity: payload.gap_severity as any,
            language: (payload as any).language ?? "en",
          },
        });
        const data: any = response.data;
        const serverId: string = data?.gap_id ?? data?.data?.gap_id ?? uuidv4();
        const synced: IDigitalisationGap = {
          ...payload,
          id: serverId,
          syncStatus: SyncStatus.SYNCED,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false,
        };
        await db.digitalisationGaps.put(synced);
        return synced;
      } catch (err: any) {
        const status = err?.status ?? err?.response?.status;
        const body = err?.body ?? err?.response?.data ?? {};
        if (status === 409) {
          throw new Error(
            body?.message ??
            "A gap with this severity for this dimension in this language already exists."
          );
        }
        throw new Error(body?.message ?? err?.message ?? "Failed to create gap");
      }
    }

    // Offline fallback
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
