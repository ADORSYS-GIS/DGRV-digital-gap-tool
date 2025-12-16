import React from "react";
import { Outlet } from "react-router-dom";
import {
  Building2,
  Users,
  FilePlus2,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
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
  { to: "/second-admin/assessments", icon: FilePlus2, text: "Create Assessment" },
  { to: "/second-admin/action-plans", icon: ClipboardList, text: "Action Plan" },
  { to: "/second-admin/submissions", icon: ClipboardCheck, text: "Submissions" },
];

const SecondAdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName="Cooperative Panel"
        panelAbbreviation="C"
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-full px-6 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SecondAdminLayout;
