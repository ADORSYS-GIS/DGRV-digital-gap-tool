import { useActionPlan } from "@/hooks/action_plans/useActionPlan";
import { ActionItemCard } from "./ActionItemCard";
import { Clock, CirclePlay, CircleCheck, ThumbsUp } from "lucide-react";
import { LoadingSpinner } from "../LoadingSpinner";

interface KanbanBoardProps {
  submissionId: string;
}

export function KanbanBoard({ submissionId }: KanbanBoardProps) {
  const { data: actionPlan, isLoading, error } = useActionPlan(submissionId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500">Error loading action plan.</p>;
  }

  if (!actionPlan) {
    return <p>No action plan found for this submission.</p>;
  }

  const columns = {
    todo: actionPlan.action_items.filter((item) => item.status === "todo"),
    in_progress: actionPlan.action_items.filter(
      (item) => item.status === "in_progress",
    ),
    done: actionPlan.action_items.filter((item) => item.status === "done"),
    approved: actionPlan.action_items.filter(
      (item) => item.status === "approved",
    ),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
          <Clock className="mr-2 text-gray-500" /> To Do
          <span className="ml-auto text-sm font-bold bg-gray-300 text-gray-600 rounded-full px-2.5 py-1">
            {columns.todo.length}
          </span>
        </h2>
        <div className="space-y-4">
          {columns.todo.map((item) => (
            <ActionItemCard key={item.action_item_id} item={item} />
          ))}
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg shadow-inner">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-blue-700">
          <CirclePlay className="mr-2 text-blue-500" /> In Progress
          <span className="ml-auto text-sm font-bold bg-blue-200 text-blue-600 rounded-full px-2.5 py-1">
            {columns.in_progress.length}
          </span>
        </h2>
        <div className="space-y-4">
          {columns.in_progress.map((item) => (
            <ActionItemCard key={item.action_item_id} item={item} />
          ))}
        </div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg shadow-inner">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-green-700">
          <CircleCheck className="mr-2 text-green-500" /> Done
          <span className="ml-auto text-sm font-bold bg-green-200 text-green-600 rounded-full px-2.5 py-1">
            {columns.done.length}
          </span>
        </h2>
        <div className="space-y-4">
          {columns.done.map((item) => (
            <ActionItemCard key={item.action_item_id} item={item} />
          ))}
        </div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg shadow-inner">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-purple-700">
          <ThumbsUp className="mr-2 text-purple-500" /> Approved
          <span className="ml-auto text-sm font-bold bg-purple-200 text-purple-600 rounded-full px-2.5 py-1">
            {columns.approved.length}
          </span>
        </h2>
        <div className="space-y-4">
          {columns.approved.map((item) => (
            <ActionItemCard key={item.action_item_id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
