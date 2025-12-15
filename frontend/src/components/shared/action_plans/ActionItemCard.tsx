import { ActionItem } from "@/types/actionPlan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface ActionItemCardProps {
  item: ActionItem;
}

export function ActionItemCard({ item }: ActionItemCardProps) {
  const { t } = useTranslation();
  const statusStyles = {
    todo: {
      label: t("shared.actionPlans.statuses.todo.label", {
        defaultValue: "Not Started",
      }),
      className: "bg-gray-200 text-gray-800",
      borderColor: "border-gray-300",
    },
    in_progress: {
      label: t("shared.actionPlans.statuses.in_progress.label", {
        defaultValue: "In Progress",
      }),
      className: "bg-blue-200 text-blue-800",
      borderColor: "border-blue-300",
    },
    done: {
      label: t("shared.actionPlans.statuses.done.label", {
        defaultValue: "Completed",
      }),
      className: "bg-green-200 text-green-800",
      borderColor: "border-green-300",
    },
    approved: {
      label: t("shared.actionPlans.statuses.approved.label", {
        defaultValue: "Approved",
      }),
      className: "bg-purple-200 text-purple-800",
      borderColor: "border-purple-300",
    },
  };

  const { label, className, borderColor } = statusStyles[item.status];
  const truncateDescription = (description: string) => {
    if (description.length > 100) {
      return `${description.substring(0, 100)}...`;
    }
    return description;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={`p-4 mb-4 bg-white rounded-lg border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer`}
        >
          <h3 className="font-semibold text-md mb-2 text-gray-800">
            {item.dimension}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {truncateDescription(item.description)}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {t("shared.actionPlans.created", { defaultValue: "Created:" })}{" "}
              {new Date().toLocaleDateString()}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-full ${className}`}
            >
              {label}
            </span>
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
