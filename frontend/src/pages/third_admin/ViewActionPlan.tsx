/**
 * View Action Plan page for the Third Admin Dashboard.
 * This page displays the action plan for the user in a Kanban board format.
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, PlayCircle, CheckCircle, ThumbsUp } from "lucide-react";

const ViewActionPlan: React.FC = () => {
  // Mock action plan data
  const actionItems = [
    {
      id: 1,
      title: "User Authentication",
      description: "Implement two-factor authentication for all user accounts.",
      status: "Completed",
      date: "2025-11-04",
    },
    {
      id: 2,
      title: "Security Audit",
      description: "Conduct a security audit of the application.",
      status: "In Progress",
      date: "2025-11-04",
    },
    {
      id: 3,
      title: "Disaster Recovery",
      description: "Develop a disaster recovery plan.",
      status: "Not Started",
      date: "2025-11-04",
    },
    {
      id: 4,
      title: "Employee Training",
      description: "Provide security training for all employees.",
      status: "Not Started",
      date: "2025-11-04",
    },
    {
      id: 5,
      title: "Dependency Update",
      description: "Update third-party dependencies.",
      status: "In Progress",
      date: "2025-11-04",
    },
    {
      id: 6,
      title: "Penetration Testing",
      description: "Perform penetration testing.",
      status: "Approved",
      date: "2025-11-04",
    },
  ];

  const columns = {
    "To Do": actionItems.filter((item) => item.status === "Not Started"),
    "In Progress": actionItems.filter((item) => item.status === "In Progress"),
    Done: actionItems.filter((item) => item.status === "Completed"),
    Approved: actionItems.filter((item) => item.status === "Approved"),
  };

  const statusIcons = {
    "To Do": <Clock className="mr-2 h-5 w-5 text-gray-500" />,
    "In Progress": <PlayCircle className="mr-2 h-5 w-5 text-blue-500" />,
    Done: <CheckCircle className="mr-2 h-5 w-5 text-green-500" />,
    Approved: <ThumbsUp className="mr-2 h-5 w-5 text-purple-500" />,
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold">Action Plan</h1>
          <p className="text-gray-600">
            Track your action items from to-do to approved.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(columns).map(([status, items]) => (
          <Card key={status} className="bg-white rounded-lg border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center">
                {statusIcons[status as keyof typeof statusIcons]}
                <CardTitle className="text-lg font-semibold">
                  {status}
                </CardTitle>
              </div>
              <Badge variant="secondary">{items.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length > 0 ? (
                items.map((item) => (
                  <Card key={item.id} className="bg-gray-50 shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-md mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created: {item.date}</span>
                        <Badge variant="outline">{item.status}</Badge>
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
        ))}
      </div>
    </div>
  );
};

export default ViewActionPlan;
