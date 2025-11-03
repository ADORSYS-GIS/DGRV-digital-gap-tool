import Dexie, { Table } from "dexie";
import { Organization } from "@/types/organization";

export class AppDB extends Dexie {
  organizations!: Table<Organization>;

  constructor() {
    super("dgatDB");
    this.version(1).stores({
      organizations: "++id, name, domain, syncStatus",
    });
  }
}

export const db = new AppDB();
