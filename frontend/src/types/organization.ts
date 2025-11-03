export type SyncStatus =
  | "new"
  | "synced"
  | "updated"
  | "deleted"
  | "sync_error";

export interface Organization {
  id: string; // Can be a client-generated UUID for new items
  name: string;
  domain: string;
  syncStatus: SyncStatus;
  createdAt?: string;
  updatedAt?: string;
}
