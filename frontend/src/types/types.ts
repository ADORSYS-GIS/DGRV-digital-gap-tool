import { KeycloakUser } from "@/openapi-client/types.gen";

export enum SyncStatus {
  SYNCED = "SYNCED",
  PENDING = "PENDING",
}

export type UserWithSync = KeycloakUser & {
  orgId: string;
  syncStatus: SyncStatus;
};
