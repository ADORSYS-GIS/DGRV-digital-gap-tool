export type SyncStatus = "synced" | "pending" | "error";

export interface OfflineEntity {
  id: string;
  syncStatus: SyncStatus;
  lastModified: string;
}