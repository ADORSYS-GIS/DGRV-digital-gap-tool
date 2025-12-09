import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Building2,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  Menu,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navLinks = [
    { to: "/admin/dashboard", icon: BarChart3, text: "Dashboard" },
    { to: "/admin/organizations", icon: Building2, text: "Organizations" },
    { to: "/admin/dimensions", icon: Settings, text: "Dimensions" },
    { to: "/admin/recommendations", icon: FileText, text: "Recommendations" },
    { to: "/admin/action-plan", icon: Settings, text: "Action Plan" },
    { to: "/admin/digital-gaps", icon: Settings, text: "Digital Gaps" },
    { to: "/admin/manage-users", icon: Users, text: "Manage Users" },
    { to: "/admin/reports", icon: BarChart3, text: "View Reports" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={cn(
          "bg-gray-800 text-white transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20",
        )}
      >
        <div className="flex items-center justify-between p-4">
          {isSidebarOpen && (
            <span className="text-2xl font-bold">Admin Panel</span>
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
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
