import { SyncStatus } from "./sync";

export interface Cooperation {
  id: string;
  name: string;
  description: string;
  syncStatus?: SyncStatus;
}