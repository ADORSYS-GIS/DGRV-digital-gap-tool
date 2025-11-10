export type SyncStatus = "synced" | "pending" | "error" | "new";

export interface OfflineEntity {
  id: string;
  syncStatus: SyncStatus;
  lastModified: string;
}