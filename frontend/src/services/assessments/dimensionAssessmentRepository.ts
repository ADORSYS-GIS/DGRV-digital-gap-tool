import {
  IDimensionAssessment,
  IDimensionState,
  IDimensionWithStates,
  ISubmitDimensionAssessmentRequest,
} from "@/types/dimension";
import { SyncStatus } from "@/types/sync";
import { v4 as uuidv4 } from "uuid";
import {
  createDimensionAssessment as createDimensionAssessmentApi,
  getDimensionWithStates as getDimensionWithStatesApi,
  updateDimensionAssessment as updateDimensionAssessmentApi,
} from "../../openapi-client/services.gen";
import { ApiError } from "@/openapi-client/core/ApiError";
import { db } from "../db";
import { syncService } from "../sync/syncService";

interface DimensionStateResponse {
  current_state_id?: string;
  desired_state_id?: string;
  dimension_id: string;
  score: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface DimensionWithStatesResponse {
  current_states: DimensionStateResponse[];
  desired_states: DimensionStateResponse[];
  dimension: {
    dimension_id: string;
    name: string;
    description: string | null;
  };
}

const mapToDimensionWithStates = (
  data: DimensionWithStatesResponse,
): IDimensionWithStates => {
  const currentStateData = data.current_states[0];
  const desiredStateData = data.desired_states[0];

  const allStates = [...data.current_states, ...data.desired_states]
    .reduce((acc: IDimensionState[], state) => {
      if (!acc.some((s) => s.level === state.score)) {
        acc.push({
          id: state.current_state_id || state.desired_state_id || "",
          dimensionId: state.dimension_id,
          level: state.score,
          description: state.description,
          createdAt: state.created_at,
          updatedAt: state.updated_at,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.level - b.level);

  const result: IDimensionWithStates = {
    id: data.dimension.dimension_id,
    name: data.dimension.name,
    description: data.dimension.description || null,
    syncStatus: SyncStatus.SYNCED,
    lastError: "",
    states: allStates,
    current_states: data.current_states.map((s) => ({
      id: s.current_state_id || "",
      dimensionId: s.dimension_id,
      level: s.score,
      description: s.description,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    })),
    desired_states: data.desired_states.map((s) => ({
      id: s.desired_state_id || "",
      dimensionId: s.dimension_id,
      level: s.score,
      description: s.description,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    })),
  };

  if (currentStateData) {
    result.currentState = {
      id: currentStateData.current_state_id || "",
      dimensionId: currentStateData.dimension_id,
      level: currentStateData.score,
      description: currentStateData.description,
      createdAt: currentStateData.created_at,
      updatedAt: currentStateData.updated_at,
    };
  }

  if (desiredStateData) {
    result.desiredState = {
      id: desiredStateData.desired_state_id || "",
      dimensionId: desiredStateData.dimension_id,
      level: desiredStateData.score,
      description: desiredStateData.description,
      createdAt: desiredStateData.created_at,
      updatedAt: desiredStateData.updated_at,
    };
  }

  return result;
};

interface DimensionStateData {
  id: string;
  dimension_id: string;
  level: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface DimensionAssessmentData {
  dimension_assessment_id?: string;
  id?: string;
  dimension_id?: string;
  dimensionId?: string;
  assessment_id?: string;
  assessmentId?: string;
  current_level?: number;
  desired_level?: number;
  currentState?: Partial<IDimensionState>;
  desiredState?: Partial<IDimensionState>;
  current_state?: DimensionStateData;
  desired_state?: DimensionStateData;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  syncStatus?: SyncStatus;
  lastError?: string;
  gap_id?: string;
}

const mapToDimensionAssessment = (
  data: DimensionAssessmentData,
): IDimensionAssessment => {
  const id = data.dimension_assessment_id || data.id;
  if (!id) {
    throw new Error("Assessment ID is missing in mapToDimensionAssessment");
  }

  const dimensionId = data.dimension_id || data.dimensionId;
  const assessmentId = data.assessment_id || data.assessmentId;

  if (!dimensionId) {
    throw new Error("Dimension ID is missing in mapToDimensionAssessment");
  }
  if (!assessmentId) {
    throw new Error(
      "Parent Assessment ID is missing in mapToDimensionAssessment",
    );
  }

  const currentLevel = data.current_level ?? data.currentState?.level ?? 0;
  const desiredLevel = data.desired_level ?? data.desiredState?.level ?? 0;

  const currentState: IDimensionState = data.current_state
    ? {
        id: data.current_state.id,
        dimensionId: data.current_state.dimension_id,
        level: data.current_state.level,
        description: data.current_state.description,
        createdAt: data.current_state.created_at,
        updatedAt: data.current_state.updated_at,
      }
    : {
        id: data.currentState?.id || `temp-${uuidv4()}`,
        dimensionId: dimensionId,
        level: currentLevel,
        description: `Level ${currentLevel}`,
        createdAt: data.currentState?.createdAt || new Date().toISOString(),
        updatedAt: data.currentState?.updatedAt || new Date().toISOString(),
      };

  const desiredState: IDimensionState = data.desired_state
    ? {
        id: data.desired_state.id,
        dimensionId: data.desired_state.dimension_id,
        level: data.desired_state.level,
        description: data.desired_state.description,
        createdAt: data.desired_state.created_at,
        updatedAt: data.desired_state.updated_at,
      }
    : {
        id: data.desiredState?.id || `temp-${uuidv4()}`,
        dimensionId: dimensionId,
        level: desiredLevel,
        description: `Level ${desiredLevel}`,
        createdAt: data.desiredState?.createdAt || new Date().toISOString(),
        updatedAt: data.desiredState?.updatedAt || new Date().toISOString(),
      };

  const assessment: IDimensionAssessment = {
    id,
    dimensionId,
    assessmentId,
    currentState,
    desiredState,
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
    syncStatus: data.syncStatus || SyncStatus.SYNCED,
    lastError: data.lastError || "",
  };

  if (data.gap_id) {
    assessment.gap_id = data.gap_id;
  }

  return assessment;
};

export const dimensionAssessmentRepository = {
  /**
   * Fetches a dimension with its current and desired states
   * @param dimensionId - The ID of the dimension to fetch
   */
  getDimensionWithStates: async (
    dimensionId: string,
  ): Promise<IDimensionWithStates> => {
    try {
      if (navigator.onLine) {
        const response = await getDimensionWithStatesApi({ id: dimensionId });
        if (response.data) {
          // Map the API response to our domain model
          const dimension = mapToDimensionWithStates(
            response.data as unknown as DimensionWithStatesResponse,
          );

          // Only store the basic dimension info in the dimensions table
          const dbDimension = {
            id: dimension.id,
            name: dimension.name,
            description: dimension.description || null,
            syncStatus: SyncStatus.SYNCED,
            lastError: "",
          };

          try {
            await db.dimensions.put(dbDimension);
          } catch (dbError) {
            console.error("Error storing dimension in IndexedDB:", dbError);
            // Continue even if storing in IndexedDB fails
          }

          return dimension;
        }
      }

      // Fall back to local DB if offline or API call fails
      const localDimension = await db.dimensions.get(dimensionId);
      if (!localDimension) {
        throw new Error(`Dimension ${dimensionId} not found in local database`);
      }
      return localDimension;
    } catch (error) {
      console.error(`Error fetching dimension ${dimensionId}:`, error);
      throw error;
    }
  },

  /**
   * Submits a new dimension assessment
   * @param payload - The assessment data to submit
   */
  submitAssessment: async (
    payload: ISubmitDimensionAssessmentRequest,
    forceCreate: boolean = false,
  ): Promise<IDimensionAssessment> => {
    if (!payload.assessmentId) {
      throw new Error("Assessment ID is required");
    }
    if (!payload.organizationId) {
      throw new Error("Organization ID is required");
    }

    // Check if an assessment already exists for this dimension and assessment
    const existingAssessment =
      await dimensionAssessmentRepository.getByDimensionAndAssessment(
        payload.dimensionId,
        payload.assessmentId,
      );

    // If we already have a synced record and we're not forcing creation, try to update
    if (
      existingAssessment &&
      existingAssessment.syncStatus === SyncStatus.SYNCED &&
      !forceCreate
    ) {
      try {
        return await dimensionAssessmentRepository.updateAssessment(
          existingAssessment.id,
          payload,
        );
      } catch (error) {
        const status =
          error instanceof ApiError
            ? error.status
            : undefined;
        // If backend says not found, fall back to create
        if (status === 404) {
          console.warn(
            "Update failed with 404; retrying as create for assessment",
            payload.assessmentId,
          );
        } else {
          throw error;
        }
      }
    }

    const requestBody: {
      dimension_id: string;
      current_state_id: string;
      desired_state_id: string;
      gap_score: number;
      organization_id: string;
      cooperation_id?: string;
    } = {
      dimension_id: payload.dimensionId,
      current_state_id: payload.currentStateId,
      desired_state_id: payload.desiredStateId,
      gap_score: payload.gapScore,
      organization_id: payload.organizationId,
    };
    if (payload.cooperationId) {
      requestBody.cooperation_id = payload.cooperationId;
    }

    const newAssessmentId = existingAssessment?.id || uuidv4();
    const newAssessment: IDimensionAssessment = {
      id: newAssessmentId,
      dimensionId: payload.dimensionId,
      assessmentId: payload.assessmentId,
      currentState: {
        id: `temp-${uuidv4()}`,
        dimensionId: payload.dimensionId,
        level: payload.currentLevel,
        description: `Level ${payload.currentLevel}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      desiredState: {
        id: `temp-${uuidv4()}`,
        dimensionId: payload.dimensionId,
        level: payload.desiredLevel,
        description: `Level ${payload.desiredLevel}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: SyncStatus.PENDING,
      lastError: "",
    };

    try {
      // If we already have a local record for this dimension+assessment,
      // update it in place; otherwise create a new one. This avoids
      // Dexie "Key already exists in the object store" constraint errors.
      const writeFn = existingAssessment
        ? db.dimensionAssessments.put.bind(db.dimensionAssessments)
        : db.dimensionAssessments.add.bind(db.dimensionAssessments);

      await writeFn({
        ...newAssessment,
        syncStatus: SyncStatus.PENDING,
        lastError: "",
      } as IDimensionAssessment & { syncStatus: string; lastError: string });

      // Add to sync queue for background processing
      await syncService.addToSyncQueue(
        "DimensionAssessment",
        newAssessment.id,
        "CREATE",
        {
          dimension_id: payload.dimensionId,
          assessment_id: payload.assessmentId,
          current_state_id: payload.currentStateId,
          desired_state_id: payload.desiredStateId,
          gap_score: payload.gapScore,
          organization_id: payload.organizationId,
          cooperation_id: payload.cooperationId,
        },
      );

      // If online, try to sync immediately
      if (navigator.onLine) {
        try {
          const response = await createDimensionAssessmentApi({
            id: payload.assessmentId,
            requestBody,
          });

          if (response.data) {
            const serverAssessment = mapToDimensionAssessment(
              response.data as unknown as DimensionAssessmentData,
            );
            await dimensionAssessmentRepository.markAsSynced(
              newAssessment.id,
              serverAssessment,
            );
            const syncedAssessment = await db.dimensionAssessments.get(
              serverAssessment.id,
            );
            if (!syncedAssessment) {
              throw new Error(
                "Failed to retrieve synced assessment from local DB",
              );
            }
            return syncedAssessment;
          }
        } catch (error) {
          console.error("Error submitting assessment:", error);

          // If the backend reports that the parent assessment is missing,
          // keep the local record as pending and do NOT treat this as a hard failure.
          if (error instanceof ApiError && error.status === 404) {
            await dimensionAssessmentRepository.markAsFailed(
              newAssessment.id,
              "Remote assessment not found yet; keeping local record pending.",
            );
            return newAssessment;
          }

          await dimensionAssessmentRepository.markAsFailed(
            newAssessment.id,
            error instanceof Error
              ? error.message
              : "Failed to submit assessment",
          );
          throw error;
        }
      }

      return newAssessment;
    } catch (error) {
      console.error("Error saving assessment locally:", error);
      throw new Error("Failed to save assessment locally");
    }
  },

  /**
   * Updates an existing dimension assessment
   * @param assessmentId - The ID of the assessment to update
   * @param payload - The updated assessment data
   */
  updateAssessment: async (
    assessmentId: string,
    payload: ISubmitDimensionAssessmentRequest,
  ): Promise<IDimensionAssessment> => {
    const existingAssessment = await db.dimensionAssessments.get(assessmentId);
    if (!existingAssessment) {
      // If assessment doesn't exist locally, try to submit as new
      if (payload.assessmentId) {
        return dimensionAssessmentRepository.submitAssessment(payload);
      }
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    const updatedAssessment: IDimensionAssessment = {
      ...existingAssessment,
      currentState: {
        ...existingAssessment.currentState,
        level: payload.currentLevel,
        description: `Level ${payload.currentLevel}`,
        updatedAt: new Date().toISOString(),
      },
      desiredState: {
        ...existingAssessment.desiredState,
        level: payload.desiredLevel,
        description: `Level ${payload.desiredLevel}`,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
      syncStatus: SyncStatus.PENDING,
      lastError: "",
    };

    try {
      await db.dimensionAssessments.update(assessmentId, {
        ...updatedAssessment,
        syncStatus: SyncStatus.PENDING,
        lastError: "",
      } as IDimensionAssessment & { syncStatus: string; lastError: string });

      // Add to sync queue for background processing
      await syncService.addToSyncQueue(
        "DimensionAssessment",
        assessmentId,
        "UPDATE",
        {
          dimension_id: payload.dimensionId,
          assessment_id:
            payload.assessmentId || existingAssessment.assessmentId,
          current_state_id: payload.currentStateId,
          desired_state_id: payload.desiredStateId,
          gap_score: payload.gapScore,
        },
      );

      // If online, try to sync immediately
      if (navigator.onLine) {
        try {
          const response = await updateDimensionAssessmentApi({
            assessmentId:
              payload.assessmentId || existingAssessment.assessmentId,
            dimensionAssessmentId: assessmentId,
            requestBody: {
              dimension_id: payload.dimensionId,
              gap_score: payload.gapScore,
            },
          });

          if (response.data) {
            const serverAssessment = mapToDimensionAssessment(
              response.data as unknown as DimensionAssessmentData,
            );
            await dimensionAssessmentRepository.markAsSynced(
              assessmentId,
              serverAssessment,
            );
            const syncedAssessment = await db.dimensionAssessments.get(
              serverAssessment.id,
            );
            if (!syncedAssessment) {
              throw new Error(
                "Failed to retrieve synced assessment from local DB",
              );
            }
            return syncedAssessment;
          }
        } catch (error) {
          console.error("Error updating assessment:", error);
          await dimensionAssessmentRepository.markAsFailed(
            assessmentId,
            error instanceof Error
              ? error.message
              : "Failed to update assessment",
          );
          throw error;
        }
      }

      return updatedAssessment;
    } catch (error) {
      console.error("Error updating assessment locally:", error);
      throw new Error("Failed to update assessment locally");
    }
  },

  /**
   * Gets an assessment by ID
   * @param id - The ID of the assessment to fetch
   */
  getById: async (id: string): Promise<IDimensionAssessment | undefined> => {
    return db.dimensionAssessments.get(id);
  },

  /**
   * Gets all assessments for a specific dimension and assessment
   * @param dimensionId - The ID of the dimension
   * @param assessmentId - The ID of the assessment
   */
  getByDimensionAndAssessment: async (
    dimensionId: string,
    assessmentId: string,
  ): Promise<IDimensionAssessment | undefined> => {
    return db.dimensionAssessments
      .where("[dimensionId+assessmentId]")
      .equals([dimensionId, assessmentId])
      .first();
  },

  /**
   * Gets all assessments for a specific assessment
   * @param assessmentId - The ID of the assessment
   */
  getByAssessment: async (
    assessmentId: string,
  ): Promise<IDimensionAssessment[]> => {
    // Try to fetch from backend first if online
    if (navigator.onLine) {
      try {
        const { listDimensionAssessments } = await import(
          "../../openapi-client/services.gen"
        );

        const response = await listDimensionAssessments({
          assessmentId: assessmentId,
        });

        if (response.data?.dimension_assessments) {
          // Map the API response to our domain model and store in IndexedDB
          const assessments: IDimensionAssessment[] =
            response.data.dimension_assessments.map((da) => ({
              id: da.dimension_assessment_id,
              dimensionId: da.dimension_id,
              assessmentId: da.assessment_id,
              currentState: {
                id: da.current_state_id,
                dimensionId: da.dimension_id,
                level: 0, // Will be populated from states
                description: "",
                createdAt: da.created_at,
                updatedAt: da.updated_at,
              },
              desiredState: {
                id: da.desired_state_id,
                dimensionId: da.dimension_id,
                level: 0, // Will be populated from states
                description: "",
                createdAt: da.created_at,
                updatedAt: da.updated_at,
              },
              gap_id: da.gap_id,
              createdAt: da.created_at,
              updatedAt: da.updated_at,
              syncStatus: SyncStatus.SYNCED,
              lastError: "",
            }));

          // Store in IndexedDB for offline access
          for (const assessment of assessments) {
            await db.dimensionAssessments.put(assessment);
          }

          return assessments;
        }
      } catch (error) {
        console.error("Error fetching dimension assessments from API:", error);
        // Fall through to local DB
      }
    }

    // Fall back to local DB if offline or API call fails
    return db.dimensionAssessments
      .where("assessmentId")
      .equals(assessmentId)
      .toArray();
  },

  /**
   * Marks an assessment as synced with the server
   * @param localId - The local ID of the assessment
   * @param serverId - The server ID of the assessment
   */
  markAsSynced: async (
    localId: string,
    serverAssessment: IDimensionAssessment,
  ): Promise<void> => {
    try {
      const localAssessment = await db.dimensionAssessments.get(localId);
      if (localAssessment) {
        await db.dimensionAssessments.delete(localId);
        const newLocalAssessment: IDimensionAssessment = {
          ...localAssessment,
          id: serverAssessment.id,
          syncStatus: SyncStatus.SYNCED,
          lastError: "",
          createdAt: serverAssessment.createdAt,
          updatedAt: serverAssessment.updatedAt,
        };
        if (serverAssessment.gap_id) {
          newLocalAssessment.gap_id = serverAssessment.gap_id;
        }
        await db.dimensionAssessments.add(newLocalAssessment);
      }
    } catch (error) {
      console.error(`Error marking assessment ${localId} as synced:`, error);
      throw error;
    }
  },

  /**
   * Marks an assessment as failed to sync
   * @param id - The ID of the assessment
   * @param error - The error that occurred
   */
  markAsFailed: async (id: string, error: string): Promise<void> => {
    try {
      await db.dimensionAssessments.update(id, {
        syncStatus: SyncStatus.FAILED,
        lastError: error,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error marking assessment ${id} as failed:`, error);
      throw error;
    }
  },

  /**
   * Deletes a dimension assessment
   * @param id - The ID of the assessment to delete
   */
  delete: async (id: string): Promise<void> => {
    try {
      const assessment = await db.dimensionAssessments.get(id);
      if (assessment) {
        // Add to sync queue for background processing
        await syncService.addToSyncQueue("DimensionAssessment", id, "DELETE", {
          id,
        });

        // Delete from local DB
        await db.dimensionAssessments.delete(id);
      }
    } catch (error) {
      console.error(`Error deleting assessment ${id}:`, error);
      throw new Error("Failed to delete assessment");
    }
  },
};
