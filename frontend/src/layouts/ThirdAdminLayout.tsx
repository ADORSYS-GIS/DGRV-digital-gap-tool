import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Users,
  FilePenLine,
  ClipboardList,
  Inbox,
  ChevronLeft,
  Menu,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ThirdAdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navLinks = [
    { to: "/third-admin/dashboard", icon: BarChart3, text: "Dashboard" },
    { to: "/third-admin/users", icon: Users, text: "Manage Users" },
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

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={cn(
          "bg-slate-900 text-white transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-72" : "w-24",
        )}
      >
        <div className="flex items-center justify-between p-6">
          {isSidebarOpen && (
            <span className="text-2xl font-extrabold">Third Admin</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-slate-800"
          >
            {isSidebarOpen ? <ChevronLeft /> : <Menu />}
          </button>
        </div>
        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={cn(
                    "flex items-center p-4 text-lg hover:bg-slate-800",
                    location.pathname === link.to && "bg-slate-950",
                  )}
                >
                  <link.icon className="h-6 w-6" />
                  {isSidebarOpen && <span className="ml-4">{link.text}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ThirdAdminLayout;
