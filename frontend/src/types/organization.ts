export type SyncStatus = "synced" | "new" | "updated" | "deleted" | "failed";

export interface Organization {
  id: string;
  name: string;
  description: string;
  domain: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
  syncError?: string;
}
