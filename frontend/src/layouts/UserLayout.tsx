import * as React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/shared/Navbar";
import { Sidebar } from "@/components/shared/Sidebar";
import {
  FilePenLine,
  ClipboardList,
  Inbox,
  LayoutDashboard,
} from "lucide-react";

const userNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Answer Assessment",
    href: "/dashboard/answer-assessment",
    icon: FilePenLine,
  },
  {
    name: "View Action Plan",
    href: "/dashboard/action-plan",
    icon: ClipboardList,
  },
  {
    name: "View Submissions",
    href: "/dashboard/submissions",
    icon: Inbox,
  },
];

const UserLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navigation={userNavigation} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;