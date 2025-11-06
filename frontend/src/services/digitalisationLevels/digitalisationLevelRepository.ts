import { ICreateCurrentStateRequest, ICreateDesiredStateRequest, IDigitalisationLevel, LevelType, LevelState } from "@/types/digitalisationLevel";
import { SyncStatus } from "@/types/sync/index";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { syncService } from "../sync/syncService";
import {
  createCurrentState,
  updateCurrentState,
  deleteCurrentState,
  createDesiredState,
  updateDesiredState,
  deleteDesiredState,
  getDimensionWithStates,
} from "@/openapi-client/services.gen";

export const digitalisationLevelRepository = {
  getByDimensionId: (dimensionId: string) =>
    db.digitalisationLevels.where({ dimensionId }).toArray(),

  // Current State Operations
  addCurrentState: async (
    dimensionId: string,
    currentState: ICreateCurrentStateRequest
  ): Promise<IDigitalisationLevel> => {
    const newCurrentState: IDigitalisationLevel = {
      id: currentState.id || uuidv4(),
      syncStatus: SyncStatus.PENDING,
      dimensionId: dimensionId,
      levelType: "current",
      state: currentState.score as LevelState,
      title: currentState.title,
      description: currentState.description ?? null,
      level: currentState.level ?? null,
      characteristics: currentState.characteristics ?? null,
    };
    await db.digitalisationLevels.add(newCurrentState);
    syncService.addToSyncQueue("CurrentState", newCurrentState.id, "CREATE", newCurrentState);
    return newCurrentState;
  },

  updateCurrentState: async (
    dimensionId: string,
    currentStateId: string,
    changes: Partial<ICreateCurrentStateRequest>
  ): Promise<void> => {
    const existingCurrentState = await db.digitalisationLevels.get(currentStateId);
    if (!existingCurrentState) {
      console.warn(`CurrentState with ID ${currentStateId} not found in IndexedDB.`);
      return;
    }

    await db.digitalisationLevels.update(currentStateId, { ...changes, syncStatus: SyncStatus.PENDING });
    syncService.addToSyncQueue("CurrentState", currentStateId, "UPDATE", { dimensionId, ...existingCurrentState, ...changes });
  },

  deleteCurrentState: async (dimensionId: string, currentStateId: string): Promise<void> => {
    const existingCurrentState = await db.digitalisationLevels.get(currentStateId);
    if (!existingCurrentState) {
      console.warn(`CurrentState with ID ${currentStateId} not found in IndexedDB.`);
      return;
    }

    await db.digitalisationLevels.update(currentStateId, { syncStatus: SyncStatus.PENDING });
    syncService.addToSyncQueue("CurrentState", currentStateId, "DELETE", { dimensionId, id: currentStateId });
  },

  // Desired State Operations
  addDesiredState: async (
    dimensionId: string,
    desiredState: ICreateDesiredStateRequest
  ): Promise<IDigitalisationLevel> => {
    const newDesiredState: IDigitalisationLevel = {
      id: desiredState.id || uuidv4(),
      syncStatus: SyncStatus.PENDING,
      dimensionId: dimensionId,
      levelType: "desired",
      state: desiredState.score as LevelState,
      title: desiredState.title,
      description: desiredState.description ?? null,
      level: desiredState.level ?? null,
      success_criteria: desiredState.success_criteria ?? null,
      target_date: desiredState.target_date ?? null,
    };
    await db.digitalisationLevels.add(newDesiredState);
    syncService.addToSyncQueue("DesiredState", newDesiredState.id, "CREATE", newDesiredState);
    return newDesiredState;
  },

  updateDesiredState: async (
    dimensionId: string,
    desiredStateId: string,
    changes: Partial<ICreateDesiredStateRequest>
  ): Promise<void> => {
    const existingDesiredState = await db.digitalisationLevels.get(desiredStateId);
    if (!existingDesiredState) {
      console.warn(`DesiredState with ID ${desiredStateId} not found in IndexedDB.`);
      return;
    }

    await db.digitalisationLevels.update(desiredStateId, { ...changes, syncStatus: SyncStatus.PENDING });
    syncService.addToSyncQueue("DesiredState", desiredStateId, "UPDATE", { dimensionId, ...existingDesiredState, ...changes });
  },

  deleteDesiredState: async (dimensionId: string, desiredStateId: string): Promise<void> => {
    const existingDesiredState = await db.digitalisationLevels.get(desiredStateId);
    if (!existingDesiredState) {
      console.warn(`DesiredState with ID ${desiredStateId} not found in IndexedDB.`);
      return;
    }

    await db.digitalisationLevels.update(desiredStateId, { syncStatus: SyncStatus.PENDING });
    syncService.addToSyncQueue("DesiredState", desiredStateId, "DELETE", { dimensionId, id: desiredStateId });
  },

  // Read Operations
  getAllCurrentStates: async (dimensionId: string): Promise<IDigitalisationLevel[]> => {
    try {
      if (navigator.onLine) {
        const backendData = await getDimensionWithStates({ id: dimensionId });
        if (backendData.data?.current_states) {
          const syncedStates = backendData.data.current_states.map((s) => ({
            ...s,
            id: s.current_state_id,
            dimensionId: dimensionId,
            levelType: "current" as LevelType,
            state: s.score as LevelState,
            title: s.title,
            description: s.description ?? null,
            level: s.level ?? null,
            characteristics: s.characteristics ?? null,
            syncStatus: SyncStatus.SYNCED,
            lastError: "",
          }));
          // Clear existing current states for this dimension and add new ones
          await db.digitalisationLevels.where({ dimensionId, levelType: "current" }).delete();
          await db.digitalisationLevels.bulkAdd(syncedStates);
          console.log(`Current states for dimension ${dimensionId} fetched from backend and synced.`);
        }
      }
    } catch (error) {
      console.error(`Failed to sync current states for dimension ${dimensionId} from backend:`, error);
    }
    return db.digitalisationLevels.where({ dimensionId, levelType: "current" }).toArray();
  },

  getCurrentStateById: async (dimensionId: string, id: string): Promise<IDigitalisationLevel | undefined> => {
    let localState = await db.digitalisationLevels.get(id);
    try {
      if (navigator.onLine) {
        const backendData = await getDimensionWithStates({ id: dimensionId });
        const backendState = backendData.data?.current_states?.find(s => s.current_state_id === id);
        if (backendState) {
          const syncedState: IDigitalisationLevel = {
            ...backendState,
            id: backendState.current_state_id,
            dimensionId: dimensionId,
            levelType: "current" as LevelType,
            state: backendState.score as LevelState,
            title: backendState.title,
            description: backendState.description ?? null,
            level: backendState.level ?? null,
            characteristics: backendState.characteristics ?? null,
            syncStatus: SyncStatus.SYNCED,
            lastError: "",
          };
          await db.digitalisationLevels.put(syncedState);
          localState = syncedState;
          console.log(`Current state ${id} for dimension ${dimensionId} fetched from backend and synced.`);
        }
      }
    } catch (error) {
      console.error(`Failed to sync current state ${id} for dimension ${dimensionId} from backend:`, error);
    }
    return localState;
  },

  getAllDesiredStates: async (dimensionId: string): Promise<IDigitalisationLevel[]> => {
    try {
      if (navigator.onLine) {
        const backendData = await getDimensionWithStates({ id: dimensionId });
        if (backendData.data?.desired_states) {
          const syncedStates = backendData.data.desired_states.map((s) => ({
            ...s,
            id: s.desired_state_id,
            dimensionId: dimensionId,
            levelType: "desired" as LevelType,
            state: s.score as LevelState,
            title: s.title,
            description: s.description ?? null,
            level: s.level ?? null,
            success_criteria: s.success_criteria ?? null,
            target_date: s.target_date ?? null,
            syncStatus: SyncStatus.SYNCED,
            lastError: "",
          }));
          // Clear existing desired states for this dimension and add new ones
          await db.digitalisationLevels.where({ dimensionId, levelType: "desired" }).delete();
          await db.digitalisationLevels.bulkAdd(syncedStates);
          console.log(`Desired states for dimension ${dimensionId} fetched from backend and synced.`);
        }
      }
    } catch (error) {
      console.error(`Failed to sync desired states for dimension ${dimensionId} from backend:`, error);
    }
    return db.digitalisationLevels.where({ dimensionId, levelType: "desired" }).toArray();
  },

  getDesiredStateById: async (dimensionId: string, id: string): Promise<IDigitalisationLevel | undefined> => {
    let localState = await db.digitalisationLevels.get(id);
    try {
      if (navigator.onLine) {
        const backendData = await getDimensionWithStates({ id: dimensionId });
        const backendState = backendData.data?.desired_states?.find(s => s.desired_state_id === id);
        if (backendState) {
          const syncedState: IDigitalisationLevel = {
            ...backendState,
            id: backendState.desired_state_id,
            dimensionId: dimensionId,
            levelType: "desired" as LevelType,
            state: backendState.score as LevelState,
            title: backendState.title,
            description: backendState.description ?? null,
            level: backendState.level ?? null,
            success_criteria: backendState.success_criteria ?? null,
            target_date: backendState.target_date ?? null,
            syncStatus: SyncStatus.SYNCED,
            lastError: "",
          };
          await db.digitalisationLevels.put(syncedState);
          localState = syncedState;
          console.log(`Desired state ${id} for dimension ${dimensionId} fetched from backend and synced.`);
        }
      }
    } catch (error) {
      console.error(`Failed to sync desired state ${id} for dimension ${dimensionId} from backend:`, error);
    }
    return localState;
  },

  // Utility methods for sync service
  markAsSynced: async (id: string, serverId: string): Promise<void> => {
    await db.digitalisationLevels.update(id, {
      id: serverId,
      syncStatus: SyncStatus.SYNCED,
      lastError: undefined,
    });
  },

  markAsFailed: (id: string, error: string) =>
    db.digitalisationLevels.update(id, { syncStatus: SyncStatus.FAILED, lastError: error }),
};
