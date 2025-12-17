import { db } from "@/services/db";
import {
  listActionPlans,
  getActionPlanByAssessmentId,
  createActionItem,
  updateActionItem,
  deleteActionItem,
} from "@/openapi-client/services.gen";
import { ActionPlan, ActionItem } from "@/types/actionPlan";
import {
  ActionPlanResponse,
  ActionItemResponse,
  CreateActionItemRequest,
  UpdateActionItemRequest,
} from "@/openapi-client/types.gen";

const mapToActionPlan = (data: ActionPlanResponse): ActionPlan => {
  return {
    ...data,
    action_items: data.action_items.map((item: ActionItemResponse) => ({
      ...item,
      status: item.status as ActionItem["status"],
      priority: item.priority as ActionItem["priority"],
      action_plan_id: data.action_plan_id,
    })),
  };
};

class ActionPlanRepository {
  async syncActionPlans() {
    try {
      const response = await listActionPlans();
      if (response.success && response.data) {
        const actionPlans = response.data.items.map(mapToActionPlan);
        await db.action_plans.bulkPut(actionPlans);
      }
    } catch (error) {
      console.error("Failed to sync action plans:", error);
    }
  }

  async getActionPlans(): Promise<ActionPlan[]> {
    await this.syncActionPlans();
    return await db.action_plans.toArray();
  }

  async getActionPlanByAssessmentId(
    assessmentId: string,
  ): Promise<ActionPlan | undefined> {
    try {
      const response = await getActionPlanByAssessmentId({ assessmentId });
      if (response.success && response.data) {
        const actionPlan = mapToActionPlan(response.data);
        await db.action_plans.put(actionPlan);
        return actionPlan;
      }
    } catch (error) {
      console.error("Failed to fetch action plan from API:", error);
    }

    // Fallback to local data if API fails or offline
    return await db.action_plans
      .where("assessment_id")
      .equals(assessmentId)
      .first();
  }

  async createActionItem(
    actionPlanId: string,
    requestBody: CreateActionItemRequest,
  ): Promise<ActionItem | undefined> {
    try {
      const response = await createActionItem({ actionPlanId, requestBody });
      if (response.success && response.data) {
        // Assuming the backend returns the full ActionItem
        return {
          ...response.data,
          status: response.data.status as ActionItem["status"],
          priority: response.data.priority as ActionItem["priority"],
          action_plan_id: actionPlanId,
        };
      }
    } catch (error) {
      console.error("Failed to create action item:", error);
    }
    return undefined;
  }

  async updateActionItem(
    actionPlanId: string,
    actionItemId: string,
    requestBody: UpdateActionItemRequest,
  ): Promise<ActionItem | undefined> {
    try {
      const response = await updateActionItem({
        actionPlanId,
        actionItemId,
        requestBody,
      });
      if (response.success && response.data) {
        return {
          ...response.data,
          status: response.data.status as ActionItem["status"],
          priority: response.data.priority as ActionItem["priority"],
          action_plan_id: actionPlanId,
        };
      }
    } catch (error) {
      console.error("Failed to update action item:", error);
    }
    return undefined;
  }

  async deleteActionItem(
    actionPlanId: string,
    actionItemId: string,
  ): Promise<boolean> {
    try {
      const response = await deleteActionItem({ actionPlanId, actionItemId });
      return response.success;
    } catch (error) {
      console.error("Failed to delete action item:", error);
      return false;
    }
  }
}

export const actionPlanRepository = new ActionPlanRepository();
