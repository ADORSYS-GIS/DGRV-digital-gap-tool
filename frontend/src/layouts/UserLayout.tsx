import React from "react";
import { Outlet } from "react-router-dom";
import {
  FilePenLine,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";

const navLinks = [
  { to: "/user/dashboard", icon: BarChart3, text: "Dashboard" },
  { to: "/user/assessments", icon: FilePenLine, text: "Answer Assessment" },
  { to: "/user/action-plans", icon: ClipboardList, text: "Action Plan" },
  { to: "/user/submissions", icon: ClipboardCheck, text: "Submissions" },
];

const UserLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName="Cooperative User"
        panelAbbreviation="U"
        infoText="This panel is for cooperative users to create assessments and view action plans."
      />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
