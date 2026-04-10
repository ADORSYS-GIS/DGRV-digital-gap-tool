import React from "react";
import { Outlet } from "react-router-dom";
import {
  Users,
  FilePenLine,
  ClipboardList,
  Inbox,
  BarChart3,
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";

const navLinks = [
  { to: "/third-admin/dashboard", icon: BarChart3, text: "Dashboard" },
  {
    to: "/third-admin/manage-cooperation-users",
    icon: Users,
    text: "Manage Users",
  },
  {
    to: "/third-admin/assessments",
    icon: FilePenLine,
    text: "Answer Assessment",
  },
  {
    to: "/third-admin/action-plans",
    icon: ClipboardList,
    text: "View Action Plan",
  },
  { to: "/third-admin/submissions", icon: Inbox, text: "View Submissions" },
];

const ThirdAdminLayout: React.FC = () => {
  return (
    <div className="flex h-full overflow-hidden bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName="Cooperative Admin"
        panelAbbreviation="T"
        infoText="This panel is for cooperative administrators to manage users and answer assessments for their cooperative."
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ThirdAdminLayout;
