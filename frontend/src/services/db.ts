import Dexie, { Table } from "dexie";
import { Organization } from "@/types/organization";
import { Cooperation } from "@/types/cooperation";

export class AppDB extends Dexie {
  organizations!: Table<Organization>;
  cooperations!: Table<Cooperation>;

  constructor() {
    super("dgatDB");
    this.version(2).stores({
      organizations: "++id, name, domain, syncStatus",
      cooperations: "++id, name, description, syncStatus",
    });
  }
}

export const db = new AppDB();
