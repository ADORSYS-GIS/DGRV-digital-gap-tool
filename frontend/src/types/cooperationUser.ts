import { SyncStatus } from "./sync";

export interface CooperationUser {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  cooperationId: string;
  syncStatus: SyncStatus;
}

export type AddCooperationUser = Omit<
  CooperationUser,
  "id" | "syncStatus" | "cooperationId"
> & {
  email: string;
};
