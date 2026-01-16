import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Building2,
  Users,
  FilePlus2,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SecondAdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const isDashboardPage = location.pathname === "/second-admin/dashboard";

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navLinks = [
    { to: "/second-admin/dashboard", icon: BarChart3, text: "Dashboard" },
    {
      to: "/second-admin/cooperations",
      icon: Building2,
      text: "Cooperatives",
    },
    {
      to: "/second-admin/manage-cooperation-users",
      icon: Users,
      text: "Manage Users",
    },
    {
      to: "/second-admin/assessments",
      icon: FilePlus2,
      text: "Create Assesment",
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
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {!isDashboardPage && (
        <aside
          className={cn(
            "bg-gray-800 text-white transition-all duration-300 ease-in-out",
            isSidebarOpen ? "w-64" : "w-20",
          )}
        >
          <div className="flex items-center justify-between p-4">
            {isSidebarOpen && (
              <span className="text-xl font-bold">Cooperative Panel</span>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-700"
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
                      "flex items-center p-4 hover:bg-gray-700",
                      location.pathname === link.to && "bg-gray-900",
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {isSidebarOpen && <span className="ml-4">{link.text}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SecondAdminLayout;
