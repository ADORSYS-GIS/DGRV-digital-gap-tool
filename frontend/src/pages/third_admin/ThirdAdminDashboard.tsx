/**
 * Third Admin dashboard page for managing specific administrative tasks.
 * This page provides:
 * - User management access
 * - Assessment answering interface
 * - Action plan viewing
 * - Submission tracking
 */
import { DashboardCard } from "@/components/shared/DashboardCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/shared/useAuth";
import {
  Users,
  FilePenLine,
  ClipboardList,
  Inbox,
  History,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";

const ThirdAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const cooperationId = useCooperationId();
  const {
    data: submissions = [],
    isLoading,
    error,
  } = useSubmissionsByCooperation(cooperationId || "", {
    enabled: !!cooperationId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Log for debugging
  console.log("Cooperation ID:", cooperationId);
  console.log("Submissions:", submissions);

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Third Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Welcome back,{" "}
          {user?.name || user?.preferred_username || "Administrator"}. Here are
          your tools to manage assessments and users.
        </p>
      </div>

      {/* Management Tools Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/third-admin/manage-cooperation-users" className="flex">
          <DashboardCard
            title="Manage Users"
            description="Administer user accounts and permissions"
            icon={Users}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/third-admin/assessments" className="flex">
          <DashboardCard
            title="Answer Assesment"
            description="Fill out and manage assessments"
            icon={FilePenLine}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/third-admin/action-plans" className="flex">
          <DashboardCard
            title="View Action Plan"
            description="Review and track action plans"
            icon={ClipboardList}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/third-admin/submissions" className="flex">
          <DashboardCard
            title="View Submissions"
            description="Browse and manage all submissions"
            icon={Inbox}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
      </div>

      {/* Recent History */}
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Recent Submissions
            </CardTitle>
            <CardDescription>
              A log of recent activities and system events.
            </CardDescription>
          </div>
          <Link to="/third-admin/submissions">
            <Button variant="outline">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading && <LoadingSpinner />}
          {error && (
            <p className="text-red-500">An error occurred: {error.message}</p>
          )}
          {submissions && (
            <SubmissionList
              submissions={submissions}
              limit={5}
              basePath="third-admin"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThirdAdminDashboard;
