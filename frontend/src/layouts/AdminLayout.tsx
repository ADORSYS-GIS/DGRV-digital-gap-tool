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
  {
    to: "/admin/consolidated-report",
    icon: FileText,
    text: "Consolidated Report",
  },
];

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-full overflow-hidden bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName="Admin Panel"
        panelAbbreviation="A"
        infoText="This is the administrator panel for managing the entire system, including organizations, dimensions, and recommendations."
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
export { AdminLayout };
