import { ActionItem } from "@/types/actionPlan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft } from "lucide-react";
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
          className={`p-4 mb-4 bg-white rounded-lg border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer relative group`}
        >
          <h3 className="font-semibold text-md mb-2 text-gray-800 pr-16">
            {item.dimension}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {truncateDescription(item.description)}
          </p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-gray-500">
              Created: {new Date().toLocaleDateString()}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-full ${className}`}
            >
              {label}
            </span>
          </div>

          {canEdit && (
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
              {currentStatusStyle.prev && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={(e) =>
                    handleStatusUpdate(e, currentStatusStyle.prev as string)
                  }
                  disabled={isUpdating}
                  title="Move to previous stage"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" /> Prev
                </Button>
              )}
              {currentStatusStyle.next && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={(e) =>
                    handleStatusUpdate(e, currentStatusStyle.next as string)
                  }
                  disabled={isUpdating}
                  title="Move to next stage"
                >
                  Next <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          )}
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
