import Dexie, { Table } from "dexie";
import { Organization } from "@/types/organization";
import { Dimension } from "@/types/dimension";
import { DigitalisationLevel } from "@/types/digitalisationLevel";
import { SyncQueueItem } from "@/types/sync";

export class AppDB extends Dexie {
  organizations!: Table<Organization>;
  dimensions!: Table<Dimension>;
  digitalisationLevels!: Table<DigitalisationLevel>;
  sync_queue!: Table<SyncQueueItem>;

  constructor() {
    super("dgatDB");
    this.version(1).stores({
      organizations: "id, name, domain, syncStatus",
      dimensions: "id, name, syncStatus",
      digitalisationLevels:
        "id, dimensionId, levelType, state, [dimensionId+levelType+state]",
      sync_queue: "++id",
    });
  }
}

export const db = new AppDB();
