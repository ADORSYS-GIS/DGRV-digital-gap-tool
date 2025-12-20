import { SyncStatus } from "./sync";

export interface Cooperation {
  id: string;
  name: string;
  description: string;
  domains: string[];
  path?: string; // Added to match the path from the ID token
  syncStatus: SyncStatus;
  syncRetries?: number;
}
