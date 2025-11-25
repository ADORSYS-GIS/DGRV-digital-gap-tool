/**
 * User dashboard page that displays assessment information and user statistics.
 * This page provides:
 * - Welcome message with user name
 * - Quick statistics overview
 * - Assessment management section
 * - Placeholder for additional content
 */
/**
 * Second admin dashboard page for cooperative management.
 * This page provides:
 * - Cooperative and user management tools
 * - Assessment creation and submission tracking
 * - Action plan overview
 */
import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import {
  ClipboardCheck,
  ClipboardList,
  FilePlus2,
  History,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: submissions, isLoading, error } = useSubmissions();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          User Management Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back,{" "}
          {user?.name || user?.preferred_username || "Administrator"}. Manage
          cooperatives and their assessments.
        </p>
      </div>

      {/* Management Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/user/assessments">
          <DashboardCard
            title="Create Assesment"
            description="Design and deploy new assessments"
            icon={FilePlus2}
            variant="default"
          />
        </Link>
        <Link to="/user/action-plans">
          <DashboardCard
            title="View Action Plan"
            description="Review and monitor strategic action plans"
            icon={ClipboardList}
            variant="default"
          />
        </Link>
        <Link to="/user/submissions">
          <DashboardCard
            title="View Submissions"
            description="Track and evaluate assessment submissions"
            icon={ClipboardCheck}
            variant="default"
          />
        </Link>
      </div>

      {/* Recent Submissions */}
      <Card>
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
          <Link to="/user/submissions">
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
              basePath="user"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
