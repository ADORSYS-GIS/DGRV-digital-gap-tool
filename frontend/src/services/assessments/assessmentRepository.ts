import { createAssessment, getAssessment } from "../../openapi-client/services.gen";
import { AssessmentResponse, CreateAssessmentRequest } from "@/openapi-client/types.gen";
import { AddAssessmentPayload, Assessment } from "../../types/assessment";
import { SyncStatus } from "../../types/sync/index";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { syncService } from "../sync/syncService";

export const assessmentRepository = {
  // Note: getAll is no longer used as we now use role-based fetching
  // through useAssessmentsByOrganization and useAssessmentsByCooperation
  // This is kept as a fallback to return local data only
  getAll: async (): Promise<Assessment[]> => {
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
  add: async (assessment: AddAssessmentPayload): Promise<Assessment> => {
    const tempId = uuidv4();
    const newAssessment: Assessment = {
      id: tempId,
      name: assessment.assessment_name,
      dimensionIds: assessment.dimensions_id,
      organization_id: assessment.organization_id,
      cooperation_id: assessment.cooperation_id,
      syncStatus: SyncStatus.PENDING,
      created_at: new Date().toISOString(),
      status: "Draft",
    };

    await db.assessments.add(newAssessment);

    try {
      const backendPayload: CreateAssessmentRequest = {
        assessment_name: assessment.assessment_name,
        dimensions_id: assessment.dimensions_id,
        cooperation_id: assessment.cooperation_id,
        organization_id: assessment.organization_id,
      };
      const backendResponse = await createAssessment({
        requestBody: backendPayload,
      });

      if (backendResponse.data?.assessment_id) {
        const syncedAssessment: Assessment = {
          ...newAssessment,
          id: backendResponse.data.assessment_id,
          syncStatus: SyncStatus.SYNCED,
          lastError: "",
        };
        // Delete the temporary record and add the new one with the correct backend ID
        await db.assessments.delete(tempId);
        await db.assessments.add(syncedAssessment);
        return syncedAssessment;
      } else {
        throw new Error("Backend did not return assessment ID");
      }
    } catch (error: any) {
      console.error("Failed to create assessment on backend:", error);
      await db.assessments.update(tempId, {
        syncStatus: SyncStatus.FAILED,
        lastError: error.message || "Unknown error",
      });
      throw error;
    }
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
    await db.assessments.update(id, { syncStatus: SyncStatus.DELETED });
    syncService.addToSyncQueue("Assessment", id, "DELETE", {
      ...existingAssessment,
      syncStatus: SyncStatus.DELETED,
    });
  },
  markAsSynced: async (offlineId: string, serverId: string): Promise<void> => {
    await db.assessments.update(offlineId, {
      id: serverId,
      syncStatus: SyncStatus.SYNCED,
      lastError: "",
    });
  },
  markAsFailed: (id: string, error: string) =>
    db.assessments.update(id, {
      syncStatus: SyncStatus.FAILED,
      lastError: error,
    }),

  deleteByOrganizationId: async (organizationId: string): Promise<void> => {
    await db.assessments
      .where("organization_id")
      .equals(organizationId)
      .delete();
  },

  deleteByCooperationId: async (cooperationId: string): Promise<void> => {
    await db.assessments.where("cooperation_id").equals(cooperationId).delete();
  },
  syncAssessments: async (
    fetchFunction: () => Promise<{
      data?: { assessments?: AssessmentResponse[] };
    }>,
    filterKey: "organization_id" | "cooperation_id",
    filterId: string,
  ): Promise<Assessment[]> => {
    try {
      if (navigator.onLine) {
        const response = await fetchFunction();
        if (response.data?.assessments) {
          const backendAssessments = response.data.assessments.map(
            (assessment: AssessmentResponse) => ({
              id: assessment.assessment_id,
              name: assessment.document_title,
              organization_id: assessment.organization_id,
              cooperation_id: assessment.cooperation_id,
              status: assessment.status,
              started_at: assessment.started_at || null,
              completed_at: assessment.completed_at || null,
              created_at: assessment.created_at,
              updated_at: assessment.updated_at || new Date().toISOString(),
              dimensionIds: (assessment.dimensions_id as string[]) ?? [],
              syncStatus: SyncStatus.SYNCED,
              lastError: "",
            }),
          );

          const backendIds = new Set(
            backendAssessments.map((a: Assessment) => a.id),
          );
          const localAssessments = await db.assessments
            .where(filterKey)
            .equals(filterId)
            .toArray();

          const idsToDelete = localAssessments
            .filter(
              (a) =>
                a.syncStatus !== SyncStatus.PENDING && !backendIds.has(a.id),
            )
            .map((a) => a.id);

          if (idsToDelete.length > 0) {
            await db.assessments.bulkDelete(idsToDelete);
          }

          await db.assessments.bulkPut(backendAssessments);
        }
      }
    } catch (error) {
      console.error("Failed to sync assessments from backend:", error);
    }
    return db.assessments.where(filterKey).equals(filterId).toArray();
  },
};
