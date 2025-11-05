import Dexie, { Table } from "dexie";
import { Organization } from "@/types/organization";
import { Dimension } from "@/types/dimension";
import { DigitalisationLevel } from "@/types/digitalisationLevel";
import { Cooperation } from "@/types/cooperation";

export class AppDB extends Dexie {
  organizations!: Table<Organization>;
  dimensions!: Table<Dimension>;
  digitalisationLevels!: Table<DigitalisationLevel>;
  cooperations!: Table<Cooperation>;
  sync_queue!: Table<{
    id?: number;
    entity: string;
    action: string;
    payload: unknown;
  }>;

  constructor() {
    super("dgatDB");
    this.version(2).stores({
      organizations: "id, name, domain, syncStatus",
      dimensions: "id, name, syncStatus",
      digitalisationLevels:
        "id, dimensionId, levelType, state, syncStatus, [dimensionId+levelType+state]",
      sync_queue: "++id",
      cooperations: "++id, name, description, syncStatus",
    });
  }
}

export const db = new AppDB();
