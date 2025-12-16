import React from "react";
import { Outlet } from "react-router-dom";
import {
  FilePlus2,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";

const navLinks = [
  { to: "/user/dashboard", icon: BarChart3, text: "Dashboard" },
  { to: "/user/assessments", icon: FilePlus2, text: "Create Assessment" },
  { to: "/user/action-plans", icon: ClipboardList, text: "Action Plan" },
  { to: "/user/submissions", icon: ClipboardCheck, text: "Submissions" },
];

const UserLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName="User Panel"
        panelAbbreviation="U"
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-full px-6 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
