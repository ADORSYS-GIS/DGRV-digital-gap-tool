export interface ActionItem {
  action_item_id: string;
  dimension_assessment_id: string;
  status: "todo" | "in_progress" | "done" | "approved";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
}

export interface ActionPlan {
  action_plan_id: string;
  assessment_id: string;
  created_at: string;
  action_items: ActionItem[];
}
