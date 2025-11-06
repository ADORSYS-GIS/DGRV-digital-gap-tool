import Dexie, { Table } from "dexie";
import { Organization } from "@/types/organization";
import { Dimension } from "@/types/dimension";
import { DigitalisationLevel } from "@/types/digitalisationLevel";
import { Cooperation } from "@/types/cooperation";
import { Gap } from "@/types/gap";
import { Assessment } from "@/types/assessment";
import { Submission } from "@/types/submission";
import { ActionItem } from "@/types/actionItem";

export class AppDB extends Dexie {
  organizations!: Table<Organization>;
  dimensions!: Table<Dimension>;
  digitalisationLevels!: Table<DigitalisationLevel>;
  cooperations!: Table<Cooperation>;
  digitalisationGaps!: Table<Gap>;
  assessments!: Table<Assessment>;
  submissions!: Table<Submission>;
  actionItems!: Table<ActionItem>;
  sync_queue!: Table<{
    id?: number;
    entity: string;
    action: string;
    payload: unknown;
  }>;

  constructor() {
    super("dgatDB");
    this.version(6).stores({
      organizations: "id, name, domain, syncStatus",
      dimensions: "id, name, syncStatus",
      digitalisationLevels:
        "id, dimensionId, levelType, state, syncStatus, [dimensionId+levelType+state]",
      cooperations: "++id, name, description, syncStatus",
      digitalisationGaps: "id, category, gap, scope, gapScore, syncStatus",
      assessments: "id, name, date, time, categories, status, syncStatus",
      submissions: "id, assessmentId, dimensionId",
      actionItems: "id, assessmentId, dimensionId, status",
      sync_queue: "++id",
    });
  }
}

export const db = new AppDB();
