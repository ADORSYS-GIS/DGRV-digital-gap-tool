import { db } from "@/services/db";
import {
  createCurrentState,
  createDesiredState,
  deleteCurrentState,
  deleteDesiredState,
  updateCurrentState,
  updateDesiredState,
} from "@/openapi-client/services.gen";
import {
  CreateCurrentStateRequest,
  CreateDesiredStateRequest,
  UpdateCurrentStateRequest,
  UpdateDesiredStateRequest,
} from "@/openapi-client/types.gen";
import { IDigitalisationLevel } from "@/types/digitalisationLevel";

type DigitalisationLevelSyncPayload =
  | IDigitalisationLevel
  | { id: string; dimensionId: string };

export const digitalisationLevelSyncService = {
  sync: async () => {
    const pendingItems = await db.sync_queue
      .where("entityType")
      .anyOf(["CurrentState", "DesiredState"])
      .toArray();

    for (const item of pendingItems) {
      try {
        const payload = item.payload as DigitalisationLevelSyncPayload;
        let success = false;

        switch (item.action) {
          case "CREATE": {
            const levelPayload = payload as IDigitalisationLevel;
            const requestBody = {
              dimension_id: levelPayload.dimensionId,
              description: levelPayload.description,
              level: levelPayload.level,
              score: levelPayload.state,
            };
            if (item.entityType === "CurrentState") {
              const response = await createCurrentState({
                id: levelPayload.dimensionId,
                requestBody: requestBody as CreateCurrentStateRequest,
              });
              if (response && response.data) {
                const newId = response.data.current_state_id;
                await db.digitalisationLevels.update(item.entityId, {
                  id: newId,
                });
                success = true;
              }
            } else {
              const response = await createDesiredState({
                id: levelPayload.dimensionId,
                requestBody: requestBody as CreateDesiredStateRequest,
              });
              if (response && response.data) {
                const newId = response.data.desired_state_id;
                await db.digitalisationLevels.update(item.entityId, {
                  id: newId,
                });
                success = true;
              }
            }
            break;
          }
          case "UPDATE": {
            const levelPayload = payload as IDigitalisationLevel;
            const requestBody = {
              description: levelPayload.description,
              level: levelPayload.level,
              score: levelPayload.state,
            };
            if (item.entityType === "CurrentState") {
              await updateCurrentState({
                dimensionId: levelPayload.dimensionId,
                currentStateId: item.entityId,
                requestBody: requestBody as UpdateCurrentStateRequest,
              });
              success = true;
            } else {
              await updateDesiredState({
                dimensionId: levelPayload.dimensionId,
                desiredStateId: item.entityId,
                requestBody: requestBody as UpdateDesiredStateRequest,
              });
              success = true;
            }
            break;
          }
          case "DELETE": {
            const deletePayload = payload as { dimensionId: string };
            if (item.entityType === "CurrentState") {
              await deleteCurrentState({
                dimensionId: deletePayload.dimensionId,
                currentStateId: item.entityId,
              });
              success = true;
            } else {
              await deleteDesiredState({
                dimensionId: deletePayload.dimensionId,
                desiredStateId: item.entityId,
              });
              success = true;
            }
            break;
          }
          default:
            console.warn(`Unknown sync action: ${item.action}`);
        }

        if (success) {
          await db.sync_queue.delete(item.id!);
        }
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
      }
    }
  },
};
