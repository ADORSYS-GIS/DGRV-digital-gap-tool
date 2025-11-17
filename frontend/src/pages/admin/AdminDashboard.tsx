/**
 * Admin dashboard page that provides administrative controls and system overview.
 * This page provides:
 * - Administrative management tools
 * - System status overview
 * - Recent activity tracking
 * - Organization and user management capabilities
 */
import { SubmissionList } from "@/components/second_admin/submissions/SubmissionList";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/shared/useAuth";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { Building2, FileText, History, Settings, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: submissions, isLoading, error } = useSubmissions();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back,{" "}
          {user?.name || user?.preferred_username || "Administrator"}. Manage
          the digital gap assessment platform.
        </p>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Organizations
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assessments Taken
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Dimensions
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Management Tools</CardTitle>
          <CardDescription>
            Access various parts of the system to manage them.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/organizations">
            <DashboardCard
              title="Manage Organizations"
              description="Create, edit, and manage organizations"
              icon={Building2}
              variant="default"
            />
          </Link>
          <Link to="/admin/dimensions">
            <DashboardCard
              title="Manage Dimensions"
              description="Create, edit, and manage dimensions"
              icon={Settings}
              variant="default"
            />
          </Link>
          <Link to="/admin/action-plan">
            <DashboardCard
              title="Manage Action Plan"
              description="Create, edit, and manage action plans"
              icon={Settings}
              variant="default"
            />
          </Link>
          <Link to="/admin/digital-gaps">
            <DashboardCard
              title="Manage Digital Gaps"
              description="Create, edit, and manage digital gaps"
              icon={Settings}
              variant="default"
            />
          </Link>
          <Link to="/admin/users">
            <DashboardCard
              title="Manage Users"
              description="Create, edit, and manage users"
              icon={Users}
              variant="default"
            />
          </Link>
          <Link to="/admin/recommendations">
            <DashboardCard
              title="Manage Recommendations"
              description="Create, edit, and manage recommendations"
              icon={FileText}
              variant="default"
            />
          </Link>
          {/* <Link to="/admin/reports">
            <DashboardCard
              title="View Reports"
              description="View system reports"
              icon={BarChart3}
              variant="default"
            />
          </Link> */}
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
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
          <Link to="/second-admin/submissions">
            <Button variant="outline">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading && <LoadingSpinner />}
          {error && (
            <p className="text-red-500">An error occurred: {error.message}</p>
          )}
          {submissions && (
            <SubmissionList submissions={submissions} limit={5} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
