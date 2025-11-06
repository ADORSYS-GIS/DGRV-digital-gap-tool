import { SyncStatus } from "./sync";

export enum GapLevel {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export interface Gap {
  id: string;
  category: string;
  gap: GapLevel;
  scope: string;
  gapScore: string;
  syncStatus?: SyncStatus;
}