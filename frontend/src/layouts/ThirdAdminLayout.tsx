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
    <div className="flex h-screen bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName="Third Admin"
        panelAbbreviation="T"
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-full px-6 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ThirdAdminLayout;
