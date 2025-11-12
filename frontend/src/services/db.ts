import Dexie, { Table } from "dexie";
import { Organization } from "@/types/organization";
import { IDimension } from "@/types/dimension";
import { IDigitalisationLevel } from "@/types/digitalisationLevel";
import { IDigitalisationGap } from "@/types/digitalisationGap";
import { SyncQueueItem } from "@/types/sync";
import { Cooperation } from "@/types/cooperation";

export class AppDB extends Dexie {
  organizations!: Table<Organization>;
  dimensions!: Table<IDimension>;
  digitalisationLevels!: Table<IDigitalisationLevel>;
  digitalisationGaps!: Table<IDigitalisationGap>;
  sync_queue!: Table<SyncQueueItem>;
  cooperations!: Table<Cooperation>;

  constructor() {
    super("dgatDB");
    this.version(2).stores({
      organizations: "id, name, domain, syncStatus",
      dimensions: "id, name, syncStatus",
      digitalisationLevels:
        "id, dimensionId, levelType, state, [dimensionId+levelType+state]",
      digitalisationGaps: "id, dimensionId, isSynced, isDeleted",
      sync_queue: "++id",
      cooperations: "++id, name, description, syncStatus",
    });
  }
}

export const db = new AppDB();
