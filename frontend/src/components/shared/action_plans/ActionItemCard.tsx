import { ActionItem } from "@/types/actionPlan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { actionPlanRepository } from "@/services/action_plans/actionPlanRepository";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { EditActionItemForm } from "./EditActionItemForm";
import { useDeleteActionItem } from "@/hooks/action_plans/useDeleteActionItem";

interface ActionItemCardProps {
  item: ActionItem;
  onUpdate?: () => void;
}

export function ActionItemCard({ item, onUpdate }: ActionItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteItemOpen, setIsDeleteItemOpen] = useState(false);
  const { roles } = useAuth();
  const { deleteItem, isDeleting } = useDeleteActionItem();

  const canEdit =
    roles.includes(ROLES.ORG_ADMIN) || roles.includes(ROLES.COOP_ADMIN);

  const statusStyles = {
    todo: {
      label: "Not Started",
      className: "bg-gray-200 text-gray-800",
      borderColor: "border-gray-300",
      prev: null,
      next: "in_progress",
    },
    in_progress: {
      label: "In Progress",
      className: "bg-blue-200 text-blue-800",
      borderColor: "border-blue-300",
      prev: "todo",
      next: "done",
    },
    done: {
      label: "Completed",
      className: "bg-green-200 text-green-800",
      borderColor: "border-green-300",
      prev: "in_progress",
      next: "approved",
    },
    approved: {
      label: "Approved",
      className: "bg-purple-200 text-purple-800",
      borderColor: "border-purple-300",
      prev: "done",
      next: null,
    },
  };

  const currentStatusStyle = statusStyles[item.status];
  const { label, className, borderColor } = currentStatusStyle;

  const truncateDescription = (description: string) => {
    if (description.length > 100) {
      return `${description.substring(0, 100)}...`;
    }
    return description;
  };

  const handleStatusUpdate = async (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation(); // Prevent opening the dialog
    setIsUpdating(true);
    try {
      const updatedItem = await actionPlanRepository.updateActionItem(
        item.action_plan_id,
        item.action_item_id,
        {
          status: newStatus,
        },
      );

      if (updatedItem) {
        toast.success(
          `Moved to ${statusStyles[newStatus as keyof typeof statusStyles].label}`,
        );
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteItem(item.action_plan_id, item.action_item_id, () => {
      setIsDeleteItemOpen(false);
      if (onUpdate) onUpdate();
    });
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <div
            className={`p-4 mb-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative group border-l-[6px] ${borderColor}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {item.priority || "Medium"} Priority
              </span>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditDialogOpen(true);
                      }}
                      title="Edit Action"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteItemOpen(true);
                      }}
                      title="Delete Action"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date().toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <h3 className="font-bold text-sm text-gray-800 mb-2 leading-tight pr-2">
              {item.title || item.dimension}
            </h3>

            <p className="text-xs text-gray-500 mb-3 line-clamp-3 leading-relaxed">
              {truncateDescription(item.description)}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide ${className}`}
              >
                {label}
              </span>

              {canEdit && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {currentStatusStyle.prev && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                      onClick={(e) =>
                        handleStatusUpdate(e, currentStatusStyle.prev as string)
                      }
                      disabled={isUpdating}
                      title="Move to previous stage"
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </Button>
                  )}
                  {currentStatusStyle.next && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                      onClick={(e) =>
                        handleStatusUpdate(e, currentStatusStyle.next as string)
                      }
                      disabled={isUpdating}
                      title="Move to next stage"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {item.title || item.dimension}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${className}`}
              >
                {label}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {item.priority || "Medium"} Priority
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
          <DialogFooter className="sm:justify-start pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              Created on{" "}
              {new Date().toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10">
            <DialogHeader className="mb-0">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Edit Action Item
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <EditActionItemForm
              item={item}
              assessmentId={item.dimension_assessment_id}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                if (onUpdate) onUpdate();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteItemOpen} onOpenChange={setIsDeleteItemOpen}>
        <DialogContent className="sm:max-w-[400px] p-6 rounded-2xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Delete Action Item
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Are you sure you want to delete this action item? This action
                cannot be undone.
              </DialogDescription>
            </div>
            <div className="flex w-full gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11"
                onClick={() => setIsDeleteItemOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-xl h-11 shadow-md shadow-red-200"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
