import { db } from "@/services/db";
import {
  listActionPlans,
  getActionPlanByAssessmentId,
} from "@/openapi-client/services.gen";
import { ActionPlan, ActionItem } from "@/types/actionPlan";
import {
  ActionPlanResponse,
  ActionItemResponse,
} from "@/openapi-client/types.gen";

const mapToActionPlan = (data: ActionPlanResponse): ActionPlan => {
  return {
    ...data,
    action_items: data.action_items.map((item: ActionItemResponse) => ({
      ...item,
      status: item.status as ActionItem["status"],
      priority: item.priority as ActionItem["priority"],
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
}

export const actionPlanRepository = new ActionPlanRepository();
