/**
 * View Action Plan page for the Second Admin Dashboard.
 * This page displays the action plan for the user in a Kanban board format.
 */
import * as React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  PlayCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ThumbsUp,
} from "lucide-react";
import { useActionItems } from "@/hooks/actionItems/useActionItems";
import { useUpdateActionItemStatus } from "@/hooks/actionItems/useUpdateActionItemStatus";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ActionItem, ActionItemStatus } from "@/types/actionItem";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { Dimension } from "@/types/dimension";

const ViewActionPlan: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { data: actionItems = [], isLoading } = useActionItems(
    assessmentId || "",
  );
  const { data: dimensions } = useDimensions();
  const updateStatusMutation = useUpdateActionItemStatus(assessmentId || "");

  const statusOrder: ActionItemStatus[] = [
    "To Do",
    "In Progress",
    "Done",
    "Approved",
  ];

  const getNextStatus = (currentStatus: ActionItemStatus): ActionItemStatus => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1]!;
    }
    return currentStatus;
  };

  const getPreviousStatus = (
    currentStatus: ActionItemStatus,
  ): ActionItemStatus => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex > 0) {
      return statusOrder[currentIndex - 1]!;
    }
    return currentStatus;
  };

  const handleStatusChange = (
    actionItemId: string,
    newStatus: ActionItemStatus,
  ) => {
    updateStatusMutation.mutate({ id: actionItemId, status: newStatus });
  };

  const columns: Record<ActionItemStatus, ActionItem[]> = {
    "To Do": actionItems.filter((item) => item.status === "To Do"),
    "In Progress": actionItems.filter((item) => item.status === "In Progress"),
    Done: actionItems.filter((item) => item.status === "Done"),
    Approved: actionItems.filter((item) => item.status === "Approved"),
  };

  const statusIcons: Record<ActionItemStatus, React.ReactElement> = {
    "To Do": <Clock className="mr-2 h-5 w-5 text-gray-500" />,
    "In Progress": <PlayCircle className="mr-2 h-5 w-5 text-blue-500" />,
    Done: <CheckCircle className="mr-2 h-5 w-5 text-green-500" />,
    Approved: <ThumbsUp className="mr-2 h-5 w-5 text-purple-500" />,
  };

  if (isLoading || !assessmentId) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold">Action Plan</h1>
          <p className="text-gray-600">
            Track your action items from to-do to done.
          </p>
        </div>
      </div>

      <div className="flex space-x-6 overflow-x-auto pb-4">
        {(Object.keys(columns) as ActionItemStatus[]).map((status) => (
          <div key={status} className="flex-shrink-0 w-80">
            <Card className="bg-white rounded-lg border shadow-sm h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  {statusIcons[status]}
                  <CardTitle className="text-lg font-semibold">
                    {status}
                  </CardTitle>
                </div>
                <Badge variant="secondary">{columns[status].length}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {columns[status].length > 0 ? (
                  columns[status].map((item) => (
                    <Card key={item.id} className="bg-gray-50 shadow-sm">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-md mb-1">
                          {dimensions?.find(
                            (d: Dimension) => d.id === item.dimensionId,
                          )?.name || "Dimension not found"}
                        </h3>
                        <p className="text-sm text-gray-700 mb-3">
                          {item.recommendation}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>
                            Created:{" "}
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(item.id, getPreviousStatus(item.status))
                            }
                            disabled={item.status === "To Do"}
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(item.id, getNextStatus(item.status))
                            }
                            disabled={item.status === "Approved"}
                          >
                            Next
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No tasks in {status.toLowerCase()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewActionPlan;