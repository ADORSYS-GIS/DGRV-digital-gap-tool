import React from "react";
import { Outlet } from "react-router-dom";
import { Building2, FileText, BarChart3, Settings, Users } from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";

const navLinks = [
  { to: "/admin/dashboard", icon: BarChart3, text: "Dashboard" },
  { to: "/admin/organizations", icon: Building2, text: "Organizations" },
  { to: "/admin/dimensions", icon: Settings, text: "Dimensions" },
  { to: "/admin/recommendations", icon: FileText, text: "Recommendations" },
  { to: "/admin/action-plans", icon: Settings, text: "Action Plan" },
  { to: "/admin/digital-gaps", icon: Settings, text: "Digital Gaps" },
  { to: "/admin/manage-users", icon: Users, text: "Manage Users" },
  { to: "/admin/reports", icon: BarChart3, text: "View Reports" },
];

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName="Admin Panel"
        panelAbbreviation="A"
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-full px-6 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
