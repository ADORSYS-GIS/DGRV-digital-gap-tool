import {
  getRecommendation,
  listRecommendations,
} from "@/openapi-client/services.gen";
import {
  ICreateRecommendationRequest,
  IRecommendation,
  IRecommendationResponse,
  IUpdateRecommendationRequest,
} from "@/types/recommendation";
import { SyncStatus } from "@/types/sync";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { syncService } from "../sync/syncService";

export const recommendationRepository = {
  getAll: async (): Promise<IRecommendation[]> => {
    // Always try to fetch from backend first if online, then update local DB
    try {
      if (navigator.onLine) {
        const response = await listRecommendations({});
        if (response.data) {
          // Handle API response format
          const items = Array.isArray(response.data)
            ? response.data
            : response.data.items || [];

          if (items.length > 0) {
            // Clear existing and bulk add new recommendations from backend
            await db.recommendations.clear();

            const syncedRecommendations = items.map((item) => ({
              id: item.recommendation_id || item.id || `temp-${Date.now()}`,
              recommendation_id:
                item.recommendation_id || item.id || `temp-${Date.now()}`,
              dimension_id: item.dimension_id,
              priority: item.priority,
              description: item.description,
              syncStatus: SyncStatus.SYNCED,
              lastError: "",
              created_at: item.created_at || new Date().toISOString(),
              updated_at: item.updated_at || new Date().toISOString(),
            }));

            await db.recommendations.bulkAdd(syncedRecommendations);
            console.log(
              "Recommendations fetched from backend and synced to IndexedDB.",
            );
          }
        }
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
          const data = response.data as IRecommendationResponse;
          const syncedRecommendation: IRecommendation = {
            id: data.recommendation_id,
            recommendation_id: data.recommendation_id,
            dimension_id: data.dimension_id,
            description: data.description,
            // Only include optional fields if they have values
            ...(data.title && { title: data.title }),
            ...(data.category && { category: data.category }),
            ...(data.priority && { priority: data.priority }),
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
      dimension_id: recommendation.dimension_id,
      priority: recommendation.priority,
      description: recommendation.description,
      syncStatus: SyncStatus.PENDING,
      lastError: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

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
    const existing = await db.recommendations.get(id);
    if (!existing) {
      console.warn(`Recommendation with ID ${id} not found in IndexedDB.`);
      return;
    }

    // Update in IndexedDB with PENDING status
    await db.recommendations.update(id, {
      ...changes,
      updated_at: new Date().toISOString(),
      syncStatus: SyncStatus.PENDING,
    });

    syncService.addToSyncQueue("Recommendation", id, "UPDATE", {
      ...existing,
      ...changes,
    });
  },

  delete: async (id: string): Promise<void> => {
    const existing = await db.recommendations.get(id);
    if (!existing) {
      console.warn(`Recommendation with ID ${id} not found in IndexedDB.`);
      return;
    }

    if (existing.syncStatus === SyncStatus.SYNCED) {
      // Mark for deletion if synced
      await db.recommendations.update(id, {
        syncStatus: SyncStatus.PENDING,
        updated_at: new Date().toISOString(),
      });
      syncService.addToSyncQueue("Recommendation", id, "DELETE", existing);
    } else {
      // Delete immediately if never synced
      await db.recommendations.delete(id);
    }
  },

  markAsSynced: async (offlineId: string, serverId: string): Promise<void> => {
    await db.recommendations.update(offlineId, {
      id: serverId,
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
