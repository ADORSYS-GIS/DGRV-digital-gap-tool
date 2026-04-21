import {
  getRecommendation,
  listRecommendations,
} from "@/openapi-client/services.gen";
import {
  ICreateRecommendationRequest,
  IRecommendation,
  IUpdateRecommendationRequest,
} from "@/types/recommendation";
import { SyncStatus } from "@/types/sync";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { syncService } from "../sync/syncService";

export const recommendationRepository = {
  getAll: async (lang = 'en'): Promise<IRecommendation[]> => {
    // Always try to fetch from backend first if online, then update local DB
    try {
      if (navigator.onLine) {
        // Fetch ALL pages from backend to avoid losing items beyond page 1
        const allItems: any[] = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
          const response = await listRecommendations({
            page: currentPage,
            pageSize: 100,
            lang,
          });
          if (response.data) {
            const responseData: any = response.data as any;
            const paginatedData =
              responseData?.data ?? responseData ?? {};
            const items: any[] = Array.isArray(paginatedData)
              ? paginatedData
              : (paginatedData.items || []);
            allItems.push(...items);
            totalPages = paginatedData.total_pages ?? 1;
          }
          currentPage++;
        } while (currentPage <= totalPages);

        // Always sync — move local items cleanup outside the length check
        // so stale data is cleared even when backend returns empty
        const localRecommendations = await db.recommendations.toArray();
        const backendRecommendationIds = new Set(
          allItems.map((item: any) => item.recommendation_id || item.id),
        );

        if (allItems.length > 0) {
          const localRecommendationsMap = new Map(
            localRecommendations.map((r: IRecommendation) => [r.id, r]),
          );

          const recommendationsToPut: IRecommendation[] = allItems
            .map((item: any) => {
              const recommendationId =
                item.recommendation_id || item.id || `temp-${Date.now()}`;
              const localRecommendation =
                localRecommendationsMap.get(recommendationId);
              if (
                localRecommendation &&
                localRecommendation.syncStatus === SyncStatus.PENDING
              ) {
                return null; // Keep local pending changes
              }
              return {
                id: recommendationId,
                recommendation_id: recommendationId,
                dimension_id: item.dimension_id,
                dimension_key: item.dimension_key,
                priority: item.priority ?? "MEDIUM",
                description: item.description,
                language: item.language ?? "en",
                syncStatus: SyncStatus.SYNCED,
                lastError: "",
                created_at: item.created_at || new Date().toISOString(),
                updated_at: item.updated_at || new Date().toISOString(),
              };
            })
            .filter((r) => r !== null)
            .map((r) => r as IRecommendation);

          if (recommendationsToPut.length > 0) {
            await db.recommendations.bulkPut(recommendationsToPut);
          }
        }

        // Always delete stale local items (runs even when backend returns empty)
        const idsToDelete = localRecommendations
          .filter(
            (r) =>
              r.syncStatus !== SyncStatus.PENDING &&
              r.syncStatus !== SyncStatus.FAILED &&
              !backendRecommendationIds.has(r.id),
          )
          .map((r) => r.id);

        if (idsToDelete.length > 0) {
          await db.recommendations.bulkDelete(idsToDelete);
        }
        console.log(
          `Recommendations fetched from backend (${allItems.length} total) and synced to IndexedDB.`,
        );
      }
    } catch (error) {
      console.error("Failed to sync recommendations from backend:", error);
      // Fallback to local data if backend sync fails
    }
    return db.recommendations.toArray(); // Always read from local DB
  },

  getById: async (id: string): Promise<IRecommendation | undefined> => {
    let localRecommendation = await db.recommendations.get(id);

    try {
      if (navigator.onLine) {
        const response = await getRecommendation({ id });
        if (response.data) {
          const data = response.data as any;
          const syncedRecommendation: IRecommendation = {
            id: data.recommendation_id,
            recommendation_id: data.recommendation_id,
            dimension_id: data.dimension_id,
            dimension_key: data.dimension_key,
            description: data.description,
            language: data.language ?? "en",
            // Only include optional fields if they have values
            ...(data.title && { title: data.title }),
            ...(data.category && { category: data.category }),
            priority: data.priority ?? "MEDIUM",
            ...(data.effort && { effort: data.effort }),
            ...(data.cost !== undefined && { cost: data.cost }),
            ...(data.impact !== undefined && { impact: data.impact }),
            created_at: data.created_at,
            updated_at: data.updated_at,
            syncStatus: SyncStatus.SYNCED,
            lastError: "",
          };
          await db.recommendations.put(syncedRecommendation);
          localRecommendation = syncedRecommendation;
          console.log(
            `Recommendation ${id} fetched from backend and synced to IndexedDB.`,
          );
        }
      }
    } catch (error) {
      console.error(`Failed to sync recommendation ${id} from backend:`, error);
      // Fallback to local data if backend sync fails
    }
    return localRecommendation; // Always read from local DB
  },

  getByIds: async (ids: string[]): Promise<IRecommendation[]> => {
    return db.recommendations.where("id").anyOf(ids).toArray();
  },

  add: async (
    recommendation: ICreateRecommendationRequest,
  ): Promise<IRecommendation> => {
    const newId = uuidv4();
    const newRecommendation: IRecommendation = {
      id: newId,
      recommendation_id: newId,
      dimension_id: recommendation.dimension_id ?? "",
      priority: recommendation.priority,
      description: recommendation.description,
      syncStatus: SyncStatus.PENDING,
      lastError: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Store extra fields for sync
      ...(recommendation.dimension_key && { dimension_key: recommendation.dimension_key } as any),
      ...((recommendation as any).language && { language: (recommendation as any).language } as any),
    };

    if (navigator.onLine) {
      const { createRecommendation } = await import("@/openapi-client/services.gen");
      try {
        const response = await createRecommendation({
          requestBody: {
            dimension_key: recommendation.dimension_key!,
            dimension_id: recommendation.dimension_id ?? null,
            priority: recommendation.priority,
            description: recommendation.description,
            language: (recommendation as any).language ?? "en",
          },
        });
        const responseData: any = response.data as any;
        const serverId: string = responseData?.recommendation_id ?? responseData?.data?.recommendation_id ?? newId;
        const synced: IRecommendation = { ...newRecommendation, id: serverId, recommendation_id: serverId, syncStatus: SyncStatus.SYNCED };
        await db.recommendations.add(synced);
        return synced;
      } catch (err: any) {
        // Extract a meaningful message from the API error response
        const status = err?.status ?? err?.response?.status;
        const body = err?.body ?? err?.response?.data ?? {};
        if (status === 409) {
          throw new Error(
            body?.message ??
            "A recommendation with this priority for this dimension in this language already exists."
          );
        }
        throw new Error(body?.message ?? err?.message ?? "Failed to create recommendation");
      }
    }

    await db.recommendations.add(newRecommendation);
    syncService.addToSyncQueue(
      "Recommendation",
      newRecommendation.id,
      "CREATE",
      newRecommendation,
    );

    return newRecommendation;
  },

  bulkAdd: async (recommendations: IRecommendation[]): Promise<void> => {
    await db.recommendations.bulkAdd(recommendations);
  },

  update: async (
    id: string,
    changes: Omit<IUpdateRecommendationRequest, "id">,
  ): Promise<void> => {
    let existing = await db.recommendations.get(id);
    if (!existing) {
      existing = await db.recommendations
        .where("recommendation_id")
        .equals(id)
        .first();
    }

    if (!existing) {
      console.warn(`Recommendation with ID ${id} not found in IndexedDB.`);
      return;
    }

    const localId = existing.id;

    // Update in IndexedDB with PENDING status
    await db.recommendations.update(localId, {
      ...changes,
      updated_at: new Date().toISOString(),
      syncStatus: SyncStatus.PENDING,
    });

    syncService.addToSyncQueue("Recommendation", localId, "UPDATE", {
      ...existing,
      ...changes,
    });
  },

  delete: async (id: string): Promise<void> => {
    let existing = await db.recommendations.get(id);
    if (!existing) {
      existing = await db.recommendations
        .where("recommendation_id")
        .equals(id)
        .first();
    }

    if (!existing) {
      console.warn(`Recommendation with ID ${id} not found in IndexedDB.`);
      return;
    }

    const localId = existing.id;

    // If the item was synced with the server, we need to queue a delete action.
    if (existing.syncStatus === SyncStatus.SYNCED) {
      syncService.addToSyncQueue("Recommendation", localId, "DELETE", existing);
    }

    // Always delete the item from the local database for immediate UI feedback.
    await db.recommendations.delete(localId);
  },

  markAsSynced: async (offlineId: string, serverId: string): Promise<void> => {
    const existing = await db.recommendations.get(offlineId);
    if (!existing) {
      return;
    }

    // Dexie cannot update the primary key via `update()`. If we keep the old
    // key, subsequent backend sync will treat it as missing and delete it.
    await db.recommendations.delete(offlineId);
    await db.recommendations.put({
      ...existing,
      id: serverId,
      recommendation_id: serverId,
      syncStatus: SyncStatus.SYNCED,
      lastError: "",
    });
  },

  markAsFailed: (id: string, error: string) =>
    db.recommendations.update(id, {
      syncStatus: SyncStatus.FAILED,
      lastError: error,
    }),
};
