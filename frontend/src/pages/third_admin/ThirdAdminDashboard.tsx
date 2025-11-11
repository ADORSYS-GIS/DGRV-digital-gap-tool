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

const ThirdAdminDashboard: React.FC = () => {
  const { user } = useAuth();

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
        <Link to="/third-admin/users" className="flex">
          <DashboardCard
            title="Manage Users"
            description="Administer user accounts and permissions"
            icon={Users}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/third-admin/answer-assessment" className="flex">
          <DashboardCard
            title="Answer Assesment"
            description="Fill out and manage assessments"
            icon={FilePenLine}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/third-admin/action-plan" className="flex">
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
        <CardHeader>
          <div className="flex items-center space-x-3">
            <History className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <div>
              <CardTitle>Recent History</CardTitle>
              <CardDescription>
                A log of recent activities and events in the system.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Recent history will be displayed here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThirdAdminDashboard;
