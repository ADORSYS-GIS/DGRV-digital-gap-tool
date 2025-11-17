import { OfflineEntity } from "@/types/sync";
import { Table } from "dexie";

export class SyncManager<T extends OfflineEntity, U> {
  private table: Table<T>;

  constructor(table: Table<T>) {
    this.table = table;
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
      console.error(`Failed to sync table:`, error);
    }
  }
}
