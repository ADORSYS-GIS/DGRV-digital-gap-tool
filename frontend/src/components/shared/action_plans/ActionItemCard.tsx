import { ActionItem } from "@/types/actionPlan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actionPlanRepository } from "@/services/action_plans/actionPlanRepository";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";

interface ActionItemCardProps {
  item: ActionItem;
  onUpdate?: () => void;
}

export function ActionItemCard({ item, onUpdate }: ActionItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { roles } = useAuth();

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={`p-4 mb-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative group border-l-[6px] ${borderColor}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {item.priority || "Medium"} Priority
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date().toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <h3 className="font-bold text-sm text-gray-800 mb-2 leading-tight pr-2">
            {item.dimension}
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item.dimension}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{item.description}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
