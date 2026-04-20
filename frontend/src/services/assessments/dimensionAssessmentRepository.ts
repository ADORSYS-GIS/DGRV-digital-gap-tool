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
import { IApiResponseDimensionState } from "@/types/api";

interface DimensionWithStatesResponse {
  current_states: IApiResponseDimensionState[];
  desired_states: IApiResponseDimensionState[];
  dimension: {
    dimension_id: string;
    name: string;
    description: string | null;
  };
}

const mapToDimensionWithStates = (
  data: DimensionWithStatesResponse,
): IDimensionWithStates => {
  const mapState = (state: IApiResponseDimensionState): IDimensionState => ({
    id: state.current_state_id || state.desired_state_id || uuidv4(),
    dimensionId: state.dimension_id,
    level: state.score,
    name: state.title,
    description: state.description,
    createdAt: state.created_at,
    updatedAt: state.updated_at,
  });

  const result: IDimensionWithStates = {
    id: data.dimension.dimension_id,
    name: data.dimension.name,
    description: data.dimension.description || null,
    syncStatus: SyncStatus.SYNCED,
    lastError: "",
    current_states: data.current_states.map(mapState),
    desired_states: data.desired_states.map(mapState),
  };

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
      name: "",
      description: data.current_state.description,
      createdAt: data.current_state.created_at,
      updatedAt: data.current_state.updated_at,
    }
    : {
      id: data.currentState?.id || `temp-${uuidv4()}`,
      dimensionId: dimensionId,
      level: currentLevel,
      name: "",
      description: `Level ${currentLevel}`,
      createdAt: data.currentState?.createdAt || new Date().toISOString(),
      updatedAt: data.currentState?.updatedAt || new Date().toISOString(),
    };

  const desiredState: IDimensionState = data.desired_state
    ? {
      id: data.desired_state.id,
      dimensionId: data.desired_state.dimension_id,
      level: data.desired_state.level,
      name: "",
      description: data.desired_state.description,
      createdAt: data.desired_state.created_at,
      updatedAt: data.desired_state.updated_at,
    }
    : {
      id: data.desiredState?.id || `temp-${uuidv4()}`,
      dimensionId: dimensionId,
      level: desiredLevel,
      name: "",
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

          // Cache the basic dimension info
          const dbDimension = {
            id: dimension.id,
            name: dimension.name,
            description: dimension.description || null,
            syncStatus: SyncStatus.SYNCED,
            lastError: "",
          };

          try {
            await db.dimensions.put(dbDimension);
            // Also cache the FULL dimension data (with states) for offline use
            await db.dimensionWithStates.put(dimension);
          } catch (dbError) {
            console.error("Error storing dimension in IndexedDB:", dbError);
          }

          return dimension;
        }
      }

      // Offline or API returned no data — serve from cache
      const cached = await db.dimensionWithStates.get(dimensionId);
      if (cached) return cached;

      // Last-resort: basic dimension info only (no states)
      const localDimension = await db.dimensions.get(dimensionId);
      if (localDimension) {
        return {
          ...localDimension,
          current_states: [],
          desired_states: [],
        } as IDimensionWithStates;
      }

      throw new Error(`Dimension ${dimensionId} not found in local database. Please go online to load this dimension.`);
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
    if (!payload.currentStateId) {
      throw new Error("Current state ID is required");
    }
    if (!payload.desiredStateId) {
      throw new Error("Desired state ID is required");
    }

    // Check if an assessment already exists for this dimension and assessment
    const existingAssessment =
      await dimensionAssessmentRepository.getByDimensionAndAssessment(
        payload.dimensionId,
        payload.assessmentId,
      );

    // If we already have a synced record and we're online and not forcing creation, try to update
    if (
      existingAssessment &&
      existingAssessment.syncStatus === SyncStatus.SYNCED &&
      !forceCreate &&
      navigator.onLine  // Skip API update when offline — fall through to local save
    ) {
      try {
        return await dimensionAssessmentRepository.updateAssessment(
          existingAssessment.id,
          payload,
        );
      } catch (error) {
        const status = error instanceof ApiError ? error.status : undefined;
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
        id: payload.currentStateId,
        dimensionId: payload.dimensionId,
        level: payload.currentLevel,
        name: "",
        description: `Level ${payload.currentLevel}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      desiredState: {
        id: payload.desiredStateId,
        dimensionId: payload.dimensionId,
        level: payload.desiredLevel,
        name: "",
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
        id: payload.currentStateId,
        level: payload.currentLevel,
        description: `Level ${payload.currentLevel}`,
        updatedAt: new Date().toISOString(),
      },
      desiredState: {
        ...existingAssessment.desiredState,
        id: payload.desiredStateId,
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
              current_state_id: payload.currentStateId,
              desired_state_id: payload.desiredStateId,
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
          const assessments: IDimensionAssessment[] = [];

          for (const da of response.data.dimension_assessments) {
            const assessment: IDimensionAssessment = {
              id: da.dimension_assessment_id,
              dimensionId: da.dimension_id,
              assessmentId: da.assessment_id,
              currentState: {
                id: da.current_state_id,
                dimensionId: da.dimension_id,
                level: 0,
                name: "",
                description: "",
                createdAt: da.created_at,
                updatedAt: da.updated_at,
              },
              desiredState: {
                id: da.desired_state_id,
                dimensionId: da.dimension_id,
                level: 0,
                name: "",
                description: "",
                createdAt: da.created_at,
                updatedAt: da.updated_at,
              },
              gap_id: da.gap_id,
              createdAt: da.created_at,
              updatedAt: da.updated_at,
              syncStatus: SyncStatus.SYNCED,
              lastError: "",
            };

            // Try to populate levels from local DB if available
            const currentLevel = await db.digitalisationLevels.get(
              da.current_state_id,
            );
            if (currentLevel) {
              assessment.currentState.level = Number(currentLevel.level ?? currentLevel.state ?? 0);
              assessment.currentState.name = currentLevel.title;
              assessment.currentState.description =
                currentLevel.description || "";
            }

            const desiredLevel = await db.digitalisationLevels.get(
              da.desired_state_id,
            );
            if (desiredLevel) {
              assessment.desiredState.level = Number(desiredLevel.level ?? desiredLevel.state ?? 0);
              assessment.desiredState.name = desiredLevel.title;
              assessment.desiredState.description =
                desiredLevel.description || "";
            }

            // If levels still missing, fetch from backend via dimension with-states
            if (assessment.currentState.level === 0 || assessment.desiredState.level === 0) {
              try {
                const { getDimensionWithStates } = await import(
                  "../../openapi-client/services.gen"
                );
                const dimData = await getDimensionWithStates({ id: da.dimension_id });
                if (dimData.data) {
                  const cs = dimData.data.current_states?.find(
                    (s) => s.current_state_id === da.current_state_id,
                  );
                  const ds = dimData.data.desired_states?.find(
                    (s) => s.desired_state_id === da.desired_state_id,
                  );
                  if (cs) {
                    assessment.currentState.level = cs.score ?? 0;
                    assessment.currentState.name = cs.title;
                    assessment.currentState.description = cs.description ?? "";
                  }
                  if (ds) {
                    assessment.desiredState.level = ds.score ?? 0;
                    assessment.desiredState.name = ds.title;
                    assessment.desiredState.description = ds.description ?? "";
                  }
                }
              } catch {
                // ignore, use score as fallback
              }
            }

            assessments.push(assessment);
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
