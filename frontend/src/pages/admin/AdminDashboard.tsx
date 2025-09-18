/**
 * Admin dashboard page that provides administrative controls and system overview.
 * This page provides:
 * - Administrative management tools
 * - System status overview
 * - Recent activity tracking
 * - Organization and user management capabilities
 */
import { DashboardCard } from "@/components/shared/DashboardCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/shared/useAuth";
import { BarChart3, Building2, Settings, Shield, Users } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const handleManageOrganizations = () => {
    toast.success("Managing organizations...");
  };

  const handleManageUsers = () => {
    toast.success("Managing users...");
  };

  const handleViewReports = () => {
    toast.success("Viewing system reports...");
  };

  return (
    <div className="container mx-auto p-6">
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

      {/* Management Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Management Actions */}
        <DashboardCard
          title="Management Tools"
          description="Administrative actions and system management"
          icon={Settings}
          variant="default"
        >
          <div className="space-y-3">
            <Button className="w-full" onClick={handleManageOrganizations}>
              <Building2 className="h-4 w-4 mr-2" />
              Manage Organizations
            </Button>
            <Button className="w-full" onClick={handleManageUsers}>
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button className="w-full" onClick={handleViewReports}>
              <BarChart3 className="h-4 w-4 mr-2" />
              View System Reports
            </Button>
            <Button variant="outline" className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </DashboardCard>

        {/* System Status */}
        <DashboardCard
          title="System Status"
          description="Platform overview and quick statistics"
          icon={BarChart3}
          variant="success"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">0</div>
                <p className="text-sm text-blue-600">Organizations</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">0</div>
                <p className="text-sm text-green-600">Active Users</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">0</div>
                <p className="text-sm text-purple-600">Assessments</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">0</div>
                <p className="text-sm text-orange-600">Pending</p>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            System notifications and recent events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              Activity feed will appear here once the system has data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
