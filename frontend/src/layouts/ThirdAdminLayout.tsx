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
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName="Third Admin"
        panelAbbreviation="T"
      />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ThirdAdminLayout;
