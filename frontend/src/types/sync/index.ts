export enum SyncStatus {
  SYNCED = "synced",
  PENDING = "pending",
  FAILED = "failed",
}

export interface OfflineEntity {
  id: string;
  syncStatus: SyncStatus;
  lastError?: string;
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
