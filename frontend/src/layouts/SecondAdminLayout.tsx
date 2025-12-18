import React from "react";
import { Outlet } from "react-router-dom";
import {
  Building2,
  Users,
  FilePlus2,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
  FileText,
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";

const navLinks = [
  { to: "/second-admin/dashboard", icon: BarChart3, text: "Dashboard" },
  { to: "/second-admin/cooperations", icon: Building2, text: "Cooperatives" },
  {
    to: "/second-admin/manage-cooperation-users",
    icon: Users,
    text: "Manage Users",
  },
  {
    to: "/second-admin/assessments",
    icon: FilePlus2,
    text: "Create Assessment",
  },
  {
    to: "/second-admin/action-plans",
    icon: ClipboardList,
    text: "Action Plan",
  },
  {
    to: "/second-admin/submissions",
    icon: ClipboardCheck,
    text: "Submissions",
  },
  {
    to: "/second-admin/reports",
    icon: BarChart3,
    text: "View Reports",
  },
  {
    to: "/second-admin/consolidated-report",
    icon: FileText,
    text: "Consolidated Report",
  },
];

const SecondAdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName="Cooperative Panel"
        panelAbbreviation="C"
      />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SecondAdminLayout;
export { SecondAdminLayout };
