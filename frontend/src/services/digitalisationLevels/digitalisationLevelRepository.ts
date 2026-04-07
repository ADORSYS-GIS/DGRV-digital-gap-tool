import { getDimensionWithStates } from "@/openapi-client/services.gen";
import {
  ICreateCurrentStateRequest,
  ICreateDesiredStateRequest,
  IDigitalisationLevel,
  LevelState,
  LevelType,
} from "@/types/digitalisationLevel";
import { SyncStatus } from "@/types/sync/index";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { syncService } from "../sync/syncService";

export const digitalisationLevelRepository = {
  getByDimensionId: async (
    dimensionId: string,
  ): Promise<IDigitalisationLevel[]> => {
    try {
      if (navigator.onLine) {
        await digitalisationLevelRepository.syncByDimensionId(dimensionId);
      }
    } catch (error) {
      console.error(
        `Failed to sync digitalisation levels for dimension ${dimensionId} from backend:`,
        error,
      );
    }
    return db.digitalisationLevels.where({ dimensionId }).toArray();
  },

  syncByDimensionId: async (dimensionId: string): Promise<void> => {
    const pendingDeletes = await db.sync_queue
      .where({ action: "DELETE" })
      .filter((item) => {
        const payload = item.payload as { dimensionId?: string };
        return (
          (item.entityType === "CurrentState" ||
            item.entityType === "DesiredState") &&
          payload.dimensionId === dimensionId
        );
      })
      .toArray();
    const pendingDeleteIds = new Set(
      pendingDeletes.map((item) => item.entityId),
    );

    const backendData = await getDimensionWithStates({ id: dimensionId });
    const localLevels = await db.digitalisationLevels
      .where({ dimensionId })
      .toArray();
    const localLevelsMap = new Map(localLevels.map((l) => [l.id, l]));

    // Sync Current States
    const beCurrentStates = backendData.data?.current_states ?? [];
    const syncedCurrentStates = beCurrentStates.map((s) => ({
      id: s.current_state_id,
      dimensionId: dimensionId,
      levelType: "current" as LevelType,
      state: s.score as LevelState,
      title: s.title,
      description: s.description ?? null,
      level: s.level ?? null,
      syncStatus: SyncStatus.SYNCED,
      lastError: "",
    }));

    // Sync Desired States
    const beDesiredStates = backendData.data?.desired_states ?? [];
    const syncedDesiredStates = beDesiredStates.map((s) => ({
      id: s.desired_state_id,
      dimensionId: dimensionId,
      levelType: "desired" as LevelType,
      state: s.score as LevelState,
      title: s.title,
      description: s.description ?? null,
      level: s.level ?? null,
      syncStatus: SyncStatus.SYNCED,
      lastError: "",
    }));

    const allSyncedStates = [...syncedCurrentStates, ...syncedDesiredStates];
    const nonPendingDeleteStates = allSyncedStates.filter(
      (s) => !pendingDeleteIds.has(s.id),
    );
    const backendLevelIds = new Set(nonPendingDeleteStates.map((s) => s.id));

    const levelsToPut = nonPendingDeleteStates.filter((s) => {
      const localLevel = localLevelsMap.get(s.id);
      return !localLevel || localLevel.syncStatus !== SyncStatus.PENDING;
    });

    const idsToDelete = localLevels
      .filter(
        (l) =>
          l.syncStatus !== SyncStatus.PENDING && !backendLevelIds.has(l.id),
      )
      .map((l) => l.id);

    if (levelsToPut.length > 0 || idsToDelete.length > 0) {
      await db.transaction("rw", db.digitalisationLevels, async () => {
        if (levelsToPut.length > 0) {
          await db.digitalisationLevels.bulkPut(levelsToPut);
        }
        if (idsToDelete.length > 0) {
          await db.digitalisationLevels.bulkDelete(idsToDelete);
        }
      });
      console.log(
        `Digitalisation levels for dimension ${dimensionId} fetched from backend and synced.`,
      );
    }
  },

  add: async (
    dimensionId: string,
    levelData: ICreateCurrentStateRequest | ICreateDesiredStateRequest,
    levelType: LevelType,
  ): Promise<IDigitalisationLevel> => {
    const newId = uuidv4();
    const newLevel: IDigitalisationLevel = {
      id: newId,
      dimensionId: dimensionId,
      levelType: levelType,
      state: levelData.score as LevelState,
      title: levelData.title,
      description: levelData.description ?? null,
      level: levelData.level ?? null,
      syncStatus: SyncStatus.PENDING,
      lastError: "",
    };

    await db.digitalisationLevels.add(newLevel);
    const entityType =
      levelType === "current" ? "CurrentState" : "DesiredState";
    syncService.addToSyncQueue(entityType, newLevel.id, "CREATE", newLevel);

    return newLevel;
  },

  update: async (
    levelId: string,
    changes: Partial<ICreateCurrentStateRequest | ICreateDesiredStateRequest>,
  ): Promise<void> => {
    const existingLevel = await db.digitalisationLevels.get(levelId);
    if (!existingLevel) {
      console.warn(`Level with ID ${levelId} not found in IndexedDB.`);
      return;
    }

    const updatedLevel = { ...existingLevel, ...changes };
    await db.digitalisationLevels.update(levelId, {
      ...changes,
      syncStatus: SyncStatus.PENDING,
    });

    const entityType =
      existingLevel.levelType === "current" ? "CurrentState" : "DesiredState";
    syncService.addToSyncQueue(entityType, levelId, "UPDATE", updatedLevel);
  },

  delete: async (levelId: string): Promise<void> => {
    const existingLevel = await db.digitalisationLevels.get(levelId);
    if (!existingLevel) {
      console.warn(`Level with ID ${levelId} not found in IndexedDB.`);
      return;
    }

    if (navigator.onLine) {
      const { request } = await import("@/openapi-client/core/request");
      const { OpenAPI } = await import("@/openapi-client/core/OpenAPI");
      try {
        if (existingLevel.levelType === "current") {
          await request(OpenAPI, {
            method: "DELETE",
            url: "/dimensions/{dimension_id}/current-states/{current_state_id}",
            path: {
              dimension_id: existingLevel.dimensionId,
              current_state_id: levelId,
            },
          });
        } else {
          await request(OpenAPI, {
            method: "DELETE",
            url: "/dimensions/{dimension_id}/desired-states/{desired_state_id}",
            path: {
              dimension_id: existingLevel.dimensionId,
              desired_state_id: levelId,
            },
          });
        }
        await db.digitalisationLevels.delete(levelId);
        // Clean up any stale sync queue entries
        await db.sync_queue
          .where({ entityId: levelId })
          .delete();
        return;
      } catch (error) {
        console.error(`Failed to delete level ${levelId} from backend:`, error);
        throw error;
      }
    }

    // Offline: queue for later sync
    const entityType =
      existingLevel.syncStatus === SyncStatus.PENDING
        ? null
        : existingLevel.levelType === "current" ? "CurrentState" : "DesiredState";

    if (existingLevel.syncStatus === SyncStatus.PENDING) {
      await db.digitalisationLevels.delete(levelId);
      await db.sync_queue
        .where({ entityId: levelId })
        .delete();
    } else {
      await db.digitalisationLevels.delete(levelId);
      if (entityType) {
        syncService.addToSyncQueue(entityType, levelId, "DELETE", {
          id: levelId,
          dimensionId: existingLevel.dimensionId,
        });
      }
    }
  },

  markAsSynced: async (id: string, serverId: string): Promise<void> => {
    const level = await db.digitalisationLevels.get(id);
    if (level) {
      await db.digitalisationLevels.update(id, {
        id: serverId, // Update the id to the one from the server
        syncStatus: SyncStatus.SYNCED,
        lastError: "",
      });
    }
  },

  markAsFailed: (id: string, error: string) =>
    db.digitalisationLevels.update(id, {
      syncStatus: SyncStatus.FAILED,
      lastError: error,
    }),
};
