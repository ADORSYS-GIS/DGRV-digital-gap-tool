export enum SyncStatus {
  SYNCED = "synced",
  PENDING = "pending",
  FAILED = "failed",
  DIRTY = "dirty",
  NEW = "new",
  UPDATED = "updated",
  DELETED = "deleted",
}

export interface OfflineEntity {
  id: string;
  syncStatus: SyncStatus;
  lastError?: string;
  syncRetries?: number;
}

export interface SyncQueueItem {
  id?: number;
  entityType: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  payload: unknown;
  timestamp: string;
  retries: number;
  lastError?: string;
}
