import {
  getAssessment,
  listAssessments,
} from "../../openapi-client/services.gen";
import { Assessment } from "../../types/assessment";
import { SyncStatus } from "../../types/sync/index";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { syncService } from "../sync/syncService";

export const assessmentRepository = {
  getAll: async (): Promise<Assessment[]> => {
    try {
      if (navigator.onLine) {
        const backendAssessments = await listAssessments({});
        if (backendAssessments.data) {
          await db.assessments.clear();
          const syncedAssessments = backendAssessments.data.items.map((a) => ({
            ...a,
            id: a.assessment_id,
            name: a.document_title,
            dimensionIds: (a.dimensions_id as string[]) ?? [],
            syncStatus: SyncStatus.SYNCED,
            lastError: "",
          }));
          await db.assessments.bulkAdd(syncedAssessments);
        }
      }
    } catch (error) {
      console.error("Failed to sync all assessments from backend:", error);
    }
    return db.assessments.toArray();
  },
  getById: async (id: string): Promise<Assessment | undefined> => {
    let localAssessment = await db.assessments.get(id);
    try {
      if (navigator.onLine) {
        const backendAssessment = await getAssessment({ id });
        if (backendAssessment.data) {
          const syncedAssessment: Assessment = {
            ...backendAssessment.data,
            id: backendAssessment.data.assessment_id,
            name: backendAssessment.data.document_title,
            dimensionIds:
              (backendAssessment.data.dimensions_id as string[]) ?? [],
            syncStatus: SyncStatus.SYNCED,
            lastError: "",
          };
          await db.assessments.put(syncedAssessment);
          localAssessment = syncedAssessment;
        }
      }
    } catch (error) {
      console.error(`Failed to sync assessment ${id} from backend:`, error);
    }
    return localAssessment;
  },
  add: async (assessment: {
    name: string;
    dimensionIds: string[];
  }): Promise<Assessment> => {
    const newAssessment: Assessment = {
      ...assessment,
      id: uuidv4(),
      syncStatus: SyncStatus.PENDING,
    };
    await db.assessments.add(newAssessment);
    syncService.addToSyncQueue(
      "Assessment",
      newAssessment.id,
      "CREATE",
      newAssessment,
    );
    return newAssessment;
  },
  bulkAdd: async (assessments: Assessment[]) => {
    await db.assessments.bulkAdd(assessments);
  },
  update: async (id: string, changes: Partial<Assessment>): Promise<void> => {
    const existingAssessment = await db.assessments.get(id);
    if (!existingAssessment) {
      console.warn(`Assessment with ID ${id} not found in IndexedDB.`);
      return;
    }
    await db.assessments.update(id, {
      ...changes,
      syncStatus: SyncStatus.PENDING,
    });
    syncService.addToSyncQueue("Assessment", id, "UPDATE", {
      ...existingAssessment,
      ...changes,
    });
  },
  delete: async (id: string): Promise<void> => {
    const existingAssessment = await db.assessments.get(id);
    if (!existingAssessment) {
      console.warn(`Assessment with ID ${id} not found in IndexedDB.`);
      return;
    }
    await db.assessments.update(id, { syncStatus: SyncStatus.PENDING });
    syncService.addToSyncQueue("Assessment", id, "DELETE", null);
  },
  markAsSynced: async (offlineId: string, serverId: string): Promise<void> => {
    await db.assessments.update(offlineId, {
      id: serverId,
      syncStatus: SyncStatus.SYNCED,
      lastError: null,
    });
  },
  markAsFailed: (id: string, error: string) =>
    db.assessments.update(id, {
      syncStatus: SyncStatus.FAILED,
      lastError: error,
    }),
};
