import { db } from "@/services/db";
import { Table } from "dexie";
import { OfflineEntity } from "@/types/sync";

export class SyncManager<T extends OfflineEntity, U> {
  private tableName: keyof typeof db;

  constructor(tableName: keyof typeof db) {
    this.tableName = tableName;
  }

  private get table(): Table<T> {
    return db[this.tableName] as Table<T>;
  }

  async syncWithServer(
    fetchFromServer: () => Promise<U[]>,
    transform: (item: U) => T,
  ) {
    try {
      const serverData = await fetchFromServer();
      const transformedData = serverData.map(transform);
      await this.table.bulkPut(transformedData);
    } catch (error) {
      console.error(`Failed to sync ${this.tableName}:`, error);
    }
  }
}
