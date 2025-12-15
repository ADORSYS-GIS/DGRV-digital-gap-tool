import { useState } from "react";
import { useActionPlan } from "@/hooks/action_plans/useActionPlan";
import { ActionItemCard } from "./ActionItemCard";
import { Clock, CirclePlay, CircleCheck, ThumbsUp, Plus } from "lucide-react";
import { LoadingSpinner } from "../LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddActionItemForm } from "./AddActionItemForm";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

interface KanbanBoardProps {
  submissionId: string;
}

export function KanbanBoard({ submissionId }: KanbanBoardProps) {
  const {
    data: actionPlan,
    isLoading,
    error,
    refetch,
  } = useActionPlan(submissionId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { roles } = useAuth();

  const canEdit =
    roles.includes(ROLES.ORG_ADMIN) || roles.includes(ROLES.COOP_ADMIN);

  const handleSuccess = () => {
    setIsDialogOpen(false);
    refetch();
  };

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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full items-start">
      {/* To Do Column */}
      <div className="bg-gray-50/80 rounded-xl border border-gray-200 flex flex-col h-full max-h-[calc(100vh-250px)]">
        <div className="p-4 border-b border-gray-200 bg-white/50 rounded-t-xl backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 rounded-md text-gray-600">
                <Clock className="h-4 w-4" />
              </div>
              To Do
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
              {columns.todo.length}
            </span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gray-400 w-full rounded-full opacity-50"></div>
          </div>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 h-12 border-dashed border-2 border-gray-300 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-xl mb-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Add Action Item</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10">
                  <DialogHeader className="mb-0">
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      Add New Action Item
                    </DialogTitle>
                  </DialogHeader>
                </div>
                <div className="p-6">
                  <AddActionItemForm
                    actionPlanId={actionPlan.action_plan_id}
                    assessmentId={submissionId}
                    onSuccess={handleSuccess}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}

          {columns.todo.map((item) => (
            <ActionItemCard
              key={item.action_item_id}
              item={item}
              onUpdate={refetch}
            />
          ))}

          {columns.todo.length === 0 && !canEdit && (
            <div className="text-center py-8 text-gray-400 text-sm italic">
              No items in To Do
            </div>
          )}
        </div>
      </div>

      {/* In Progress Column */}
      <div className="bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col h-full max-h-[calc(100vh-250px)]">
        <div className="p-4 border-b border-blue-100 bg-white/50 rounded-t-xl backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-blue-700 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-md text-blue-600">
                <CirclePlay className="h-4 w-4" />
              </div>
              In Progress
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
              {columns.in_progress.length}
            </span>
          </div>
          <div className="h-1 w-full bg-blue-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-blue-500 w-full rounded-full opacity-50"></div>
          </div>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
          {columns.in_progress.map((item) => (
            <ActionItemCard
              key={item.action_item_id}
              item={item}
              onUpdate={refetch}
            />
          ))}
          {columns.in_progress.length === 0 && (
            <div className="text-center py-8 text-blue-300 text-sm italic">
              No items in progress
            </div>
          )}
        </div>
      </div>

      {/* Done Column */}
      <div className="bg-green-50/50 rounded-xl border border-green-100 flex flex-col h-full max-h-[calc(100vh-250px)]">
        <div className="p-4 border-b border-green-100 bg-white/50 rounded-t-xl backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-green-700 flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-md text-green-600">
                <CircleCheck className="h-4 w-4" />
              </div>
              Done
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
              {columns.done.length}
            </span>
          </div>
          <div className="h-1 w-full bg-green-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-green-500 w-full rounded-full opacity-50"></div>
          </div>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
          {columns.done.map((item) => (
            <ActionItemCard
              key={item.action_item_id}
              item={item}
              onUpdate={refetch}
            />
          ))}
          {columns.done.length === 0 && (
            <div className="text-center py-8 text-green-300 text-sm italic">
              No items completed
            </div>
          )}
        </div>
      </div>

      {/* Approved Column */}
      <div className="bg-purple-50/50 rounded-xl border border-purple-100 flex flex-col h-full max-h-[calc(100vh-250px)]">
        <div className="p-4 border-b border-purple-100 bg-white/50 rounded-t-xl backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-purple-700 flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-md text-purple-600">
                <ThumbsUp className="h-4 w-4" />
              </div>
              Approved
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
              {columns.approved.length}
            </span>
          </div>
          <div className="h-1 w-full bg-purple-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-purple-500 w-full rounded-full opacity-50"></div>
          </div>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
          {columns.approved.map((item) => (
            <ActionItemCard
              key={item.action_item_id}
              item={item}
              onUpdate={refetch}
            />
          ))}
          {columns.approved.length === 0 && (
            <div className="text-center py-8 text-purple-300 text-sm italic">
              No items approved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
