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
import { IDimension, IDimensionAssessment, IDimensionWithStates } from "@/types/dimension";
import { IRecommendation } from "@/types/recommendation";
import { KeycloakUser } from "@/types/user";
import { OrganizationDimension } from "@/types/organizationDimension";
import { CooperationUser } from "@/types/cooperationUser";
import { IDigitalisationLevel } from "@/types/digitalisationLevel";

export class AppDB extends Dexie {
  users!: Table<KeycloakUser, string>;
  dimensionAssessments!: Table<IDimensionAssessment, string>;
  assessments!: Table<Assessment, string>;
  submissions!: Table<Submission, string>;
  organizations!: Table<Organization, string>;
  cooperations!: Table<Cooperation, string>;
  cooperationUsers!: Table<CooperationUser, string>;
  digitalisationGaps!: Table<IDigitalisationGap, [string, string]>;
  digitalisationLevels!: Table<IDigitalisationLevel, [string, string]>;
  action_plans!: Table<ActionPlan, string>;
  sync_queue!: Table<SyncQueueItem, number>;
  dimensions!: Table<IDimension, [string, string]>;
  recommendations!: Table<IRecommendation, string>;
  organizationDimensions!: Table<OrganizationDimension, string>;
  // old single-language cache (kept for migration, no longer used)
  dimensionWithStates!: Table<IDimensionWithStates, string>;
  // new per-language cache with composite primary key [id+lang]
  dimensionWithStatesCache!: Table<IDimensionWithStates & { lang: string }, [string, string]>;

  constructor() {
    super("AppDB");
    this.version(10).stores({
      assessments: "id, organization_id, cooperation_id",
      submissions: "id, assessment.organization_id",
      organizations: "id",
      cooperations: "id, syncStatus, syncRetries",
      digitalisationGaps: "id, syncStatus",
      action_plans: "action_plan_id, assessment_id",
      sync_queue: "++id, entityType, action",
      dimensions: "id",
      recommendations: "id, recommendation_id",
      dimensionAssessments: "id, [dimensionId+assessmentId], assessmentId",
      users: "id, orgId",
      organizationDimensions: "id, organizationId, syncStatus",
      cooperationUsers: "id, cooperationId, syncStatus",
      digitalisationLevels: "id, dimensionId, [dimensionId+levelType]",
    });
    this.version(11).stores({
      dimensionWithStates: "id",
    });
    this.version(12).stores({
      digitalisationGaps: "id, dimensionId, [dimensionId+currentLevel+desiredLevel]",
    });
    // v13: new table with composite key [id+lang] — cannot change PK of existing table
    this.version(13).stores({
      dimensionWithStatesCache: "[id+lang], id, lang",
    });
    this.version(14).stores({
      dimensions: "[id+lang], id, lang",
      digitalisationLevels: "[id+lang], id, lang, dimensionId, [dimensionId+levelType]",
    });
    this.version(15).stores({
      digitalisationGaps: "id, lang, dimensionId, [id+lang], [dimensionId+currentLevel+desiredLevel+lang]",
    });
    // v16: Drop tables with changed primary keys to avoid UpgradeError
    this.version(16).stores({
      dimensions: null,
      digitalisationLevels: null,
      digitalisationGaps: null,
    });
    // v17: Recreate tables with [id+lang] composite primary keys
    this.version(17).stores({
      dimensions: "[id+lang], id, lang",
      digitalisationLevels: "[id+lang], id, lang, dimensionId, [dimensionId+levelType]",
      digitalisationGaps: "[id+lang], id, lang, dimensionId, [dimensionId+currentLevel+desiredLevel+lang]",
    });
    // v18: Add optimized gap lookup index by severity
    this.version(18).stores({
      digitalisationGaps: "[id+lang], id, lang, dimensionId, [dimensionId+gap_severity+lang]",
    });
    // v20: Restore missing dimensionId index and keep dimension_key index
    this.version(20).stores({
      digitalisationGaps: "[id+lang], id, lang, dimensionId, dimension_key, [dimension_key+gap_severity+lang], [dimensionId+gap_severity+lang]",
    });
  }
}

export const db = new AppDB();
