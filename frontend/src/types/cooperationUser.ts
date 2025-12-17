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
  emailVerified?: boolean;
  /**
   * Optional list of dimension IDs that this user is allowed to answer.
   * Only relevant for coop_user roles.
   */
  dimensionIds?: string[];
}

export type AddCooperationUser = Omit<
  CooperationUser,
  "id" | "syncStatus" | "cooperationId"
> & {
  email: string;
};
