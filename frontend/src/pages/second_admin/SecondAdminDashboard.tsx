/**
 * Second admin dashboard page for cooperative management.
 * This page provides:
 * - Cooperative and user management tools
 * - Assessment creation and submission tracking
 * - Action plan overview
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
  Building2,
  Users,
  FilePlus2,
  ClipboardList,
  ClipboardCheck,
  History,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const SecondAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Second Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Welcome back,{" "}
          {user?.name || user?.preferred_username || "Administrator"}. Here are
          your tools to manage cooperations, assessments and users.
        </p>
      </div>

      {/* Management Tools Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/second-admin/cooperations" className="flex">
          <DashboardCard
            title="Manage Cooperations"
            description="Administer cooperative profiles and data"
            icon={Building2}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/second-admin/users" className="flex">
          <DashboardCard
            title="Manage Users"
            description="Oversee user accounts and permissions"
            icon={Users}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/second-admin/create-assessment" className="flex">
          <DashboardCard
            title="Create Assessment"
            description="Design and deploy new assessments"
            icon={FilePlus2}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/second-admin/action-plan" className="flex">
          <DashboardCard
            title="View Action Plan"
            description="Review and monitor strategic action plans"
            icon={ClipboardList}
            variant="default"
            titleClassName="text-xl font-bold"
            descriptionClassName="text-lg"
          />
        </Link>
        <Link to="/second-admin/submissions" className="flex">
          <DashboardCard
            title="View Submissions"
            description="Track and evaluate assessment submissions"
            icon={ClipboardCheck}
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

export default SecondAdminDashboard;
