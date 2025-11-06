import { db } from "../db";
import { ActionItem, ActionItemStatus } from "@/types/actionItem";
import { v4 as uuidv4 } from "uuid";

export const actionItemRepository = {
  async getActionItemsByAssessmentId(assessmentId: string) {
    return db.actionItems.where({ assessmentId }).toArray();
  },

  async getAllActionItems() {
    return db.actionItems.toArray();
  },

  async addActionItem(item: Omit<ActionItem, "id" | "status" | "createdAt">) {
    const id = uuidv4();
    const newActionItem: ActionItem = {
      ...item,
      id,
      status: "To Do",
      createdAt: new Date().toISOString(),
    };
    await db.actionItems.put(newActionItem);
    return newActionItem;
  },

  async updateActionItemStatus(id: string, status: ActionItemStatus) {
    await db.actionItems.update(id, { status });
  },
};