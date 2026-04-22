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
    lang = 'en',
  ): Promise<IDigitalisationLevel[]> => {
    try {
      if (navigator.onLine) {
        await digitalisationLevelRepository.syncByDimensionId(dimensionId, lang);
      }
    } catch (error) {
      console.error(
        `Failed to sync digitalisation levels for dimension ${dimensionId} from backend:`,
        error,
      );
    }
    return db.digitalisationLevels.where({ dimensionId }).toArray();
  },

  syncByDimensionId: async (dimensionId: string, lang = 'en'): Promise<void> => {
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

    const backendData = await getDimensionWithStates({ id: dimensionId, lang });
    const localLevels = await db.digitalisationLevels
      .where({ dimensionId })
      .toArray();
    const localLevelsMap = new Map(localLevels.map((l) => [l.id, l]));

    const beCurrentStates = backendData.data?.current_states ?? [];
    const syncedCurrentStates = beCurrentStates.map((s) => ({
      id: s.current_state_id,
      lang,
      dimensionId: dimensionId,
      levelType: "current" as LevelType,
      state: s.score as LevelState,
      title: s.title,
      description: s.description ?? null,
      level: String(s.score) ?? null,
      syncStatus: SyncStatus.SYNCED,
      lastError: "",
    }));

    // Sync Desired States
    const beDesiredStates = backendData.data?.desired_states ?? [];
    const syncedDesiredStates = beDesiredStates.map((s) => ({
      id: s.desired_state_id,
      lang,
      dimensionId: dimensionId,
      levelType: "desired" as LevelType,
      state: s.score as LevelState,
      title: s.title,
      description: s.description ?? null,
      level: String(s.score) ?? null,
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
      .map((l) => [l.id, l.lang] as [string, string]);

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
    if (navigator.onLine) {
      const { createCurrentState, createDesiredState } = await import("@/openapi-client/services.gen");
      const requestBody = {
        dimension_id: dimensionId,
        title: levelData.title,
        description: levelData.description ?? "",
        score: levelData.score,
        language: (levelData as any).language ?? "en",
      };
      try {
        let serverId: string;
        if (levelType === "current") {
          const response = await createCurrentState({ id: dimensionId, requestBody: requestBody as any });
          serverId = response.data?.current_state_id ?? uuidv4();
        } else {
          const response = await createDesiredState({ id: dimensionId, requestBody: requestBody as any });
          serverId = response.data?.desired_state_id ?? uuidv4();
        }
        const synced: IDigitalisationLevel = {
          id: serverId,
          lang: (levelData as any).language ?? "en",
          dimensionId,
          levelType,
          state: levelData.score as LevelState,
          title: levelData.title,
          description: levelData.description ?? null,
          level: (levelData as any).level ?? null,
          syncStatus: SyncStatus.SYNCED,
          lastError: "",
        };
        await db.digitalisationLevels.put(synced);
        return synced;
      } catch (err: any) {
        const status = err?.status ?? err?.response?.status;
        const body = err?.body ?? err?.response?.data ?? {};
        if (status === 409) {
          throw new Error(body?.message ?? "A level with this score already exists for this dimension in this language.");
        }
        throw new Error(body?.message ?? err?.message ?? "Failed to create level");
      }
    }

    // Offline fallback
    const newId = uuidv4();
    const newLevel: IDigitalisationLevel = {
      id: newId,
      lang: (levelData as any).language ?? "en",
      dimensionId,
      levelType,
      state: levelData.score as LevelState,
      title: levelData.title,
      description: levelData.description ?? null,
      level: (levelData as any).level ?? null,
      syncStatus: SyncStatus.PENDING,
      lastError: "",
    };
    await db.digitalisationLevels.add(newLevel);
    const entityType = levelType === "current" ? "CurrentState" : "DesiredState";
    syncService.addToSyncQueue(entityType, newLevel.id, "CREATE", { ...newLevel, language: (levelData as any).language ?? "en" });
    return newLevel;
  },

  update: async (
    levelId: string,
    changes: Partial<ICreateCurrentStateRequest | ICreateDesiredStateRequest>,
  ): Promise<void> => {
    const lang = (changes as any).lang || (changes as any).language;
    const existingLevel = lang
      ? await db.digitalisationLevels.get([levelId, lang])
      : await db.digitalisationLevels.where("id").equals(levelId).first();

    if (!existingLevel) {
      console.warn(`Level with ID ${levelId} not found in IndexedDB.`);
      return;
    }

    const updatedLevel = { ...existingLevel, ...changes };
    await db.digitalisationLevels.update([existingLevel.id, existingLevel.lang], {
      ...changes,
      syncStatus: SyncStatus.PENDING,
    });

    const entityType =
      existingLevel.levelType === "current" ? "CurrentState" : "DesiredState";
    syncService.addToSyncQueue(entityType, levelId, "UPDATE", updatedLevel);
  },

  delete: async (levelId: string): Promise<void> => {
    const existingLevel = await db.digitalisationLevels.where("id").equals(levelId).first();
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
        await db.digitalisationLevels.where("id").equals(levelId).delete();
        // Clean up any stale sync queue entries
        await db.sync_queue
          .filter((item) => item.entityId === levelId)
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
      await db.digitalisationLevels.delete([existingLevel.id, existingLevel.lang]);
      await db.sync_queue
        .filter((item) => item.entityId === levelId)
        .delete();
    } else {
      await db.digitalisationLevels.delete([existingLevel.id, existingLevel.lang]);
      if (entityType) {
        syncService.addToSyncQueue(entityType, levelId, "DELETE", {
          id: levelId,
          dimensionId: existingLevel.dimensionId,
        });
      }
    }
  },

  markAsSynced: async (id: string, serverId: string, lang: string): Promise<void> => {
    const level = await db.digitalisationLevels.get([id, lang]);
    if (level) {
      await db.digitalisationLevels.delete([id, lang]);
      await db.digitalisationLevels.add({
        ...level,
        id: serverId, // Update the id to the one from the server
        syncStatus: SyncStatus.SYNCED,
        lastError: "",
      });
    }
  },

  markAsFailed: async (id: string, lang: string, error: string) => {
    await db.digitalisationLevels.update([id, lang], {
      syncStatus: SyncStatus.FAILED,
      lastError: error,
    });
  },
};
