export type ActionItemStatus = "To Do" | "In Progress" | "Done" | "Approved";

export interface ActionItem {
  id: string;
  assessmentId: string;
  dimensionId: string;
  recommendation: string;
  status: ActionItemStatus;
  createdAt: string;
}