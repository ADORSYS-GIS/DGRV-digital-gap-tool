export enum SyncStatus {
  SYNCED = "SYNCED",
  PENDING = "PENDING",
  FAILED = "FAILED",
}

export type OfflineEntity = {
  id: string;
  syncStatus: SyncStatus;
  lastError?: string; // Added for failed syncs
};

export type SyncQueueItem = {
  id?: number;
  entityType: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  payload: unknown;
  timestamp: string;
  retries: number;
  lastError?: string;
};
