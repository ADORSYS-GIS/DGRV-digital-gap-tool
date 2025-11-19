import Dexie, { Table } from "dexie";
import {
  Assessment,
  AssessmentSummary as Submission,
} from "@/types/assessment";
import { Organization } from "@/types/organization";
import { Cooperation } from "@/types/cooperation";
import { IDigitalisationGap } from "@/types/digitalisationGap";
import { ActionPlan } from "@/types/actionPlan";
import { SyncQueueItem } from "@/types/sync";
import { IDimension, IDimensionAssessment } from "@/types/dimension";
import { IRecommendation } from "@/types/recommendation";
import { KeycloakUser } from "@/types/user";

export class AppDB extends Dexie {
  users!: Table<KeycloakUser, string>;
  dimensionAssessments!: Table<IDimensionAssessment, string>;
  assessments!: Table<Assessment, string>;
  submissions!: Table<Submission, string>;
  organizations!: Table<Organization, string>;
  cooperations!: Table<Cooperation, string>;
  digitalisationGaps!: Table<IDigitalisationGap, string>;
  action_plans!: Table<ActionPlan, string>;
  sync_queue!: Table<SyncQueueItem, number>;
  dimensions!: Table<IDimension, string>;
  recommendations!: Table<IRecommendation, string>;

  constructor() {
    super("AppDB");
    this.version(2).stores({
      assessments: "id",
      submissions: "id",
      organizations: "id",
      cooperations: "id, syncStatus",
      digitalisationGaps: "id",
      action_plans: "action_plan_id, assessment_id",
      sync_queue: "++id",
      dimensions: "id",
      recommendations: "id",
      dimensionAssessments: "id, [dimensionId+assessmentId]",
      users: "id, orgId",
    });
  }
}

export const db = new AppDB();
