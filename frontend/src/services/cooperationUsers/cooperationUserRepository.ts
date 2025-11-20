import { db } from "@/services/db";
import { AddCooperationUser, CooperationUser } from "@/types/cooperationUser";
import { SyncStatus } from "@/types/sync";
import { v4 as uuidv4 } from "uuid";

export const cooperationUserRepository = {
  async getAllByCooperationId(
    cooperationId: string,
  ): Promise<CooperationUser[]> {
    return db.cooperationUsers
      .where("cooperationId")
      .equals(cooperationId)
      .toArray();
  },

  async add(
    cooperationId: string,
    user: AddCooperationUser,
  ): Promise<CooperationUser> {
    const newUser: CooperationUser = {
      ...user,
      id: uuidv4(),
      cooperationId,
      syncStatus: SyncStatus.NEW,
    };
    await db.cooperationUsers.add(newUser);
    return newUser;
  },

  async delete(id: string): Promise<void> {
    const user = await db.cooperationUsers.get(id);
    if (user) {
      if (user.syncStatus === "new") {
        await db.cooperationUsers.delete(id);
      } else {
        await db.cooperationUsers.update(id, {
          syncStatus: SyncStatus.DELETED,
        });
      }
    }
  },

  async updateSyncStatus(id: string, syncStatus: SyncStatus): Promise<void> {
    await db.cooperationUsers.update(id, { syncStatus });
  },

  async getById(id: string): Promise<CooperationUser | undefined> {
    return db.cooperationUsers.get(id);
  },

  async clear(): Promise<void> {
    await db.cooperationUsers.clear();
  },

  async bulkAdd(users: CooperationUser[]): Promise<void> {
    await db.cooperationUsers.bulkAdd(users);
  },
};
