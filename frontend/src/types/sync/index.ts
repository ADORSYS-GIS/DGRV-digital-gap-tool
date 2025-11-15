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
  url: string;
  method: "POST" | "PUT" | "DELETE";
  payload: unknown;
  timestamp: number;
}
