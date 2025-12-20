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
  syncRetries?: number;
  emailVerified?: boolean;
  /**
   * Optional list of dimension IDs that this user is allowed to answer.
   * Only relevant for coop_user roles.
   */
  dimensionIds?: string[];
}

export interface AddCooperationUser {
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  dimensionIds?: string[];
}
