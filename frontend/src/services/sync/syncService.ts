import {
  adminCreateGap,
  createAssessment,
  createCurrentState,
  createDesiredState,
  createDimension,
  createRecommendation,
  deleteAssessment,
  deleteCurrentState,
  deleteDesiredState,
  deleteDimension,
  deleteGap,
  deleteRecommendation,
  updateAssessment,
  updateCurrentState,
  updateDesiredState,
  updateDimension,
  updateGap,
  updateRecommendation,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  inviteUserToOrganization,
} from "@/openapi-client/services.gen";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { db } from "@/services/db";
import { digitalisationGapRepository } from "@/services/digitalisationGaps/digitalisationGapRepository";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { organizationRepository } from "@/services/organizations/organizationRepository";
import { recommendationRepository } from "@/services/recommendations/recommendationRepository";
import { userRepository } from "@/services/users/userRepository";
import { cooperationSyncService } from "@/services/sync/cooperationSyncService";
import { Assessment } from "@/types/assessment";
import { IDigitalisationGap } from "@/types/digitalisationGap";
import { IDigitalisationLevel } from "@/types/digitalisationLevel";
import { IDimension } from "@/types/dimension";
import { Organization } from "@/types/organization";
import { IRecommendation } from "@/types/recommendation";
import { SyncQueueItem } from "@/types/sync/index";

interface IUserInvitationPayload {
  orgId: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

export const syncService = {
  async addToSyncQueue(
    entityType: string,
    entityId: string,
    action: "CREATE" | "UPDATE" | "DELETE",
    payload: unknown,
  ) {
    const item: SyncQueueItem = {
      entityType,
      entityId,
      action,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0,
    };
    await db.sync_queue.add(item);
    // Immediately attempt to process the queue after adding an item
    void syncService.processSyncQueue();
  },

  async removeFromSyncQueue(entityType: string, entityId: string) {
    const item = await db.sync_queue.where({ entityType, entityId }).first();
    if (item) {
      await db.sync_queue.delete(item.id!);
    }
  },

  async processSyncQueue() {
    const items = await db.sync_queue.toArray();
    if (navigator.onLine) {
      await cooperationSyncService.sync();
    }
    for (const item of items) {
      try {
        switch (item.entityType) {
          case "Dimension":
            await syncService.syncDimension(item);
            break;
          case "CurrentState":
            await syncService.syncCurrentState(item);
            break;
          case "DesiredState":
            await syncService.syncDesiredState(item);
            break;
          case "DigitalisationGap":
            await syncService.syncDigitalisationGap(item);
            break;
          case "Assessment":
            await syncService.syncAssessment(item);
            break;
          case "Recommendation":
            await syncService.syncRecommendation(item);
            break;
          case "Organization":
            await syncService.syncOrganization(item);
            break;
          case "UserInvitation":
            await syncService.syncUserInvitation(item);
            break;
        }
        await db.sync_queue.delete(item.id!);
      } catch (error: unknown) {
        console.error(`Sync failed for item ${item.id}:`, error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const updatedRetries = item.retries + 1;
        await db.sync_queue.update(item.id!, {
          retries: updatedRetries,
          lastError: errorMessage,
        });
        // Optionally, mark the local entity as FAILED if retries exceed a threshold
        if (updatedRetries >= 3) {
          if (item.entityType === "Dimension") {
            await dimensionRepository.markAsFailed(item.entityId, errorMessage);
          } else if (
            item.entityType === "CurrentState" ||
            item.entityType === "DesiredState"
          ) {
            await digitalisationLevelRepository.markAsFailed(
              item.entityId,
              errorMessage,
            );
          } else if (item.entityType === "DigitalisationGap") {
            // await digitalisationGapRepository.markAsFailed(item.entityId, errorMessage);
          } else if (item.entityType === "Assessment") {
            await assessmentRepository.markAsFailed(
              item.entityId,
              errorMessage,
            );
          } else if (item.entityType === "Recommendation") {
            await recommendationRepository.markAsFailed(
              item.entityId,
              errorMessage,
            );
          } else if (item.entityType === "Organization") {
            await organizationRepository.markAsFailed(
              item.entityId,
              errorMessage,
            );
          } else if (item.entityType === "UserInvitation") {
            await userRepository.markAsFailed(item.entityId, errorMessage);
          }
        }
      }
    }
  },

  async syncDimension(item: SyncQueueItem) {
    const dimensionData = item.payload as IDimension;
    switch (item.action) {
      case "CREATE": {
        console.log("Attempting to create dimension on server:", dimensionData);
        try {
          const response = await createDimension({
            requestBody: {
              name: dimensionData.name,
              description: dimensionData.description ?? null,
              category: dimensionData.category ?? null,
              is_active: dimensionData.is_active ?? null,
              weight: dimensionData.weight ?? null,
            },
          });
          if (response.data) {
            await dimensionRepository.markAsSynced(
              dimensionData.id,
              response.data.dimension_id,
            );
            console.log(
              "Dimension created and synced successfully:",
              response.data,
            );
          } else {
            throw new Error(
              response.error || "Failed to create dimension on server",
            );
          }
        } catch (error) {
          console.error("Error during createDimension API call:", error);
          throw error; // Re-throw to be caught by processSyncQueue's error handling
        }
        break;
      }
      case "UPDATE": {
        const response = await updateDimension({
          id: item.entityId,
          requestBody: {
            name: dimensionData.name,
            description: dimensionData.description ?? null,
            category: dimensionData.category ?? null,
            is_active: dimensionData.is_active ?? null,
            weight: dimensionData.weight ?? null,
          },
        });
        if (response.data) {
          await dimensionRepository.markAsSynced(
            item.entityId,
            response.data.dimension_id,
          );
        } else {
          throw new Error(
            response.error || "Failed to update dimension on server",
          );
        }
        break;
      }
      case "DELETE": {
        await deleteDimension({ id: item.entityId });
        await dimensionRepository.markAsSynced(item.entityId, item.entityId); // Mark as synced even if deleted
        break;
      }
    }
  },

  async syncCurrentState(item: SyncQueueItem) {
    const currentStateData = item.payload as IDigitalisationLevel;
    const dimensionId = currentStateData.dimensionId; // Assuming dimensionId is part of payload

    switch (item.action) {
      case "CREATE": {
        console.log(
          "Attempting to create current state on server:",
          currentStateData,
        );
        try {
          const response = await createCurrentState({
            id: dimensionId,
            requestBody: {
              dimension_id: dimensionId,
              score: currentStateData.state,
              description: currentStateData.description ?? null,
            },
          });
          if (response.data) {
            await digitalisationLevelRepository.markAsSynced(
              currentStateData.id,
              response.data.current_state_id,
            );
            console.log(
              "Current state created and synced successfully:",
              response.data,
            );
          } else {
            throw new Error(
              response.error || "Failed to create current state on server",
            );
          }
        } catch (error) {
          console.error("Error during createCurrentState API call:", error);
          throw error;
        }
        break;
      }
      case "UPDATE": {
        const response = await updateCurrentState({
          dimensionId: dimensionId,
          currentStateId: item.entityId,
          requestBody: {
            score: currentStateData.state,
            description: currentStateData.description ?? null,
          },
        });
        if (response.data) {
          await digitalisationLevelRepository.markAsSynced(
            item.entityId,
            response.data.current_state_id,
          );
        } else {
          throw new Error(
            response.error || "Failed to update current state on server",
          );
        }
        break;
      }
      case "DELETE": {
        await deleteCurrentState({
          dimensionId: dimensionId,
          currentStateId: item.entityId,
        });
        await digitalisationLevelRepository.markAsSynced(
          item.entityId,
          item.entityId,
        ); // Mark as synced even if deleted
        break;
      }
    }
  },

  async syncDesiredState(item: SyncQueueItem) {
    const desiredStateData = item.payload as IDigitalisationLevel;
    const dimensionId = desiredStateData.dimensionId; // Assuming dimensionId is part of payload

    switch (item.action) {
      case "CREATE": {
        console.log(
          "Attempting to create desired state on server:",
          desiredStateData,
        );
        try {
          const response = await createDesiredState({
            id: dimensionId,
            requestBody: {
              dimension_id: dimensionId,
              score: desiredStateData.state,
              description: desiredStateData.description ?? null,
            },
          });
          if (response.data) {
            await digitalisationLevelRepository.markAsSynced(
              desiredStateData.id,
              response.data.desired_state_id,
            );
            console.log(
              "Desired state created and synced successfully:",
              response.data,
            );
          } else {
            throw new Error(
              response.error || "Failed to create desired state on server",
            );
          }
        } catch (error) {
          console.error("Error during createDesiredState API call:", error);
          throw error;
        }
        break;
      }
      case "UPDATE": {
        const response = await updateDesiredState({
          dimensionId: dimensionId,
          desiredStateId: item.entityId,
          requestBody: {
            score: desiredStateData.state,
            description: desiredStateData.description ?? null,
          },
        });
        if (response.data) {
          await digitalisationLevelRepository.markAsSynced(
            item.entityId,
            response.data.desired_state_id,
          );
        } else {
          throw new Error(
            response.error || "Failed to update desired state on server",
          );
        }
        break;
      }
      case "DELETE": {
        await deleteDesiredState({
          dimensionId: dimensionId,
          desiredStateId: item.entityId,
        });
        await digitalisationLevelRepository.markAsSynced(
          item.entityId,
          item.entityId,
        ); // Mark as synced even if deleted
        break;
      }
    }
  },

  async syncDigitalisationGap(item: SyncQueueItem) {
    const gapData = item.payload as IDigitalisationGap;
    switch (item.action) {
      case "CREATE": {
        const response = await adminCreateGap({
          requestBody: {
            dimension_id: gapData.dimensionId,
            gap_description: gapData.scope,
            gap_severity: gapData.gap_severity,
          },
        });
        if (response.data) {
          await digitalisationGapRepository.markAsSynced(
            gapData.id,
            response.data.gap_id,
          );
        } else {
          throw new Error(
            response.error || "Failed to create digitalisation gap on server",
          );
        }
        break;
      }
      case "UPDATE": {
        const response = await updateGap({
          id: item.entityId,
          requestBody: {
            gap_description: gapData.scope,
            gap_severity: gapData.gap_severity,
          },
        });
        if (response.data) {
          await digitalisationGapRepository.markAsSynced(
            item.entityId,
            response.data.gap_id,
          );
        } else {
          throw new Error(
            response.error || "Failed to update digitalisation gap on server",
          );
        }
        break;
      }
      case "DELETE": {
        await deleteGap({ id: item.entityId });
        await digitalisationGapRepository.markAsSynced(
          item.entityId,
          item.entityId,
        );
        break;
      }
    }
  },
  async syncAssessment(item: SyncQueueItem) {
    const assessmentData = item.payload as Assessment;
    switch (item.action) {
      case "CREATE": {
        const response = await createAssessment({
          requestBody: {
            assessment_name: assessmentData.name,
            dimensions_id: assessmentData.dimensionIds || [],
            organization_id: "123", // Replace with actual organization ID
          },
        });
        if (response.data) {
          await assessmentRepository.markAsSynced(
            assessmentData.id,
            response.data.assessment_id,
          );
        } else {
          throw new Error(
            response.error || "Failed to create assessment on server",
          );
        }
        break;
      }
      case "UPDATE": {
        const response = await updateAssessment({
          id: item.entityId,
          requestBody: {
            assessment_name: assessmentData.name,
            dimensions_id: assessmentData.dimensionIds || [],
          },
        });
        if (response.data) {
          await assessmentRepository.markAsSynced(
            item.entityId,
            response.data.assessment_id,
          );
        } else {
          throw new Error(
            response.error || "Failed to update assessment on server",
          );
        }
        break;
      }
      case "DELETE": {
        await deleteAssessment({ id: item.entityId });
        await assessmentRepository.markAsSynced(item.entityId, item.entityId);
        break;
      }
    }
  },

  async syncRecommendation(item: SyncQueueItem) {
    const recommendationData = item.payload as IRecommendation;

    try {
      switch (item.action) {
        case "CREATE": {
          console.log(
            "Attempting to create recommendation on server:",
            recommendationData,
          );

          if (!recommendationData.dimension_id) {
            throw new Error(
              "Cannot create recommendation without dimension_id",
            );
          }

          // Map priority to the expected enum values (uppercase)
          const mapPriority = (
            priority?: string,
          ): "LOW" | "MEDIUM" | "HIGH" => {
            if (!priority) return "MEDIUM";
            const upper = priority.toUpperCase();
            return upper === "LOW" || upper === "MEDIUM" || upper === "HIGH"
              ? (upper as "LOW" | "MEDIUM" | "HIGH")
              : "MEDIUM";
          };

          // Create the request body according to the OpenAPI contract
          const requestBody = {
            title: recommendationData.title,
            description: recommendationData.description || "",
            dimension_id: recommendationData.dimension_id,
            ...(recommendationData.category && {
              category: recommendationData.category,
            }),
            priority: mapPriority(recommendationData.priority),
            ...(recommendationData.effort !== undefined && {
              effort: recommendationData.effort,
            }),
            ...(recommendationData.cost !== undefined && {
              cost: recommendationData.cost,
            }),
            ...(recommendationData.impact !== undefined && {
              impact: recommendationData.impact,
            }),
          };

          const createResponse = await createRecommendation({
            requestBody,
          });

          if (createResponse.data) {
            await recommendationRepository.markAsSynced(
              recommendationData.id,
              createResponse.data.recommendation_id,
            );
            console.log(
              "Recommendation created and synced successfully:",
              createResponse.data,
            );
          } else {
            throw new Error(
              createResponse.error ||
                "Failed to create recommendation on server",
            );
          }
          break;
        }

        case "UPDATE": {
          if (!recommendationData.recommendation_id) {
            throw new Error("Cannot update recommendation without server ID");
          }

          console.log(
            "Attempting to update recommendation on server:",
            recommendationData,
          );

          // Map priority to the expected enum values (uppercase)
          const mapPriority = (
            priority?: string,
          ): "LOW" | "MEDIUM" | "HIGH" => {
            if (!priority) return "MEDIUM";
            const upper = priority.toUpperCase();
            return upper === "LOW" || upper === "MEDIUM" || upper === "HIGH"
              ? (upper as "LOW" | "MEDIUM" | "HIGH")
              : "MEDIUM";
          };

          // Create the request body according to the OpenAPI contract
          const requestBody = {
            title: recommendationData.title,
            description: recommendationData.description || "",
            ...(recommendationData.dimension_id && {
              dimension_id: recommendationData.dimension_id,
            }),
            ...(recommendationData.category && {
              category: recommendationData.category,
            }),
            priority: mapPriority(recommendationData.priority),
            ...(recommendationData.effort !== undefined && {
              effort: recommendationData.effort,
            }),
            ...(recommendationData.cost !== undefined && {
              cost: recommendationData.cost,
            }),
            ...(recommendationData.impact !== undefined && {
              impact: recommendationData.impact,
            }),
          };

          const updateResponse = await updateRecommendation({
            id: recommendationData.recommendation_id,
            requestBody,
          });

          if (!updateResponse.data) {
            throw new Error(
              updateResponse.error ||
                "Failed to update recommendation on server",
            );
          }

          // Update the local record with the server response
          await recommendationRepository.markAsSynced(
            recommendationData.id,
            updateResponse.data.recommendation_id,
          );

          console.log(
            "Recommendation updated successfully:",
            updateResponse.data,
          );
          break;
        }

        case "DELETE": {
          if (!recommendationData.recommendation_id) {
            // If we don't have a server ID, just remove from local DB
            console.log(
              "Deleting local recommendation without server ID:",
              recommendationData.id,
            );
            await db.recommendations.delete(item.entityId);
            return;
          }

          console.log(
            "Deleting recommendation from server:",
            recommendationData.recommendation_id,
          );
          await deleteRecommendation({
            id: recommendationData.recommendation_id,
          });
          console.log(
            "Recommendation deleted from server, removing from local DB:",
            item.entityId,
          );
          await db.recommendations.delete(item.entityId);
          break;
        }
      }
    } catch (error) {
      console.error("Error syncing recommendation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Mark as failed in the repository
      await recommendationRepository.markAsFailed(item.entityId, errorMessage);
      throw error; // Re-throw to be caught by processSyncQueue's error handling
    }
  },
  async syncOrganization(item: SyncQueueItem) {
    const organizationData = item.payload as Organization;
    switch (item.action) {
      case "CREATE": {
        const response = await createOrganization({
          requestBody: {
            name: organizationData.name,
            enabled: "true",
            domains: [{ name: organizationData.domain }],
            redirectUrl: "http://localhost:8000/",
          },
        });
        if (response) {
          await organizationRepository.markAsSynced(
            organizationData.id,
            response.id,
          );
        } else {
          throw new Error("Failed to create organization on server");
        }
        break;
      }
      case "UPDATE": {
        await updateOrganization({
          orgId: item.entityId,
          requestBody: {
            name: organizationData.name,
            domains: [{ name: organizationData.domain }],
          },
        });
        await organizationRepository.markAsSynced(item.entityId, item.entityId);
        break;
      }
      case "DELETE": {
        await deleteOrganization({ orgId: item.entityId });
        await organizationRepository.markAsSynced(item.entityId, item.entityId);
        break;
      }
    }
  },

  async syncUserInvitation(item: SyncQueueItem) {
    const invitationData = item.payload as IUserInvitationPayload;
    switch (item.action) {
      case "CREATE": {
        const response = await inviteUserToOrganization({
          orgId: invitationData.orgId,
          requestBody: {
            email: invitationData.email,
            first_name: invitationData.first_name,
            last_name: invitationData.last_name,
            roles: invitationData.roles,
          },
        });
        if (response) {
          await userRepository.markAsSynced(item.entityId, response.user_id);
        } else {
          throw new Error("Failed to invite user on server");
        }
        break;
      }
    }
  },
};
