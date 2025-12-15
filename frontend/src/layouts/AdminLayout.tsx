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
    { to: "/admin/action-plans", icon: Settings, text: "Action Plan" },
    { to: "/admin/digital-gaps", icon: Settings, text: "Digital Gaps" },
    { to: "/admin/manage-users", icon: Users, text: "Manage Users" },
    { to: "/admin/reports", icon: BarChart3, text: "View Reports" },
  ];

  return (
    <div className="flex h-screen bg-gray-50/50">
      <aside
        className={cn(
          "bg-slate-800 text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl z-30",
          isSidebarOpen ? "w-72" : "w-20",
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-sm" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Admin Panel
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mx-auto">
              <div className="w-4 h-4 bg-primary rounded-sm" />
            </div>
          )}
          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {!isSidebarOpen && (
          <div className="flex justify-center py-4 border-b border-slate-700">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={cn(
                      "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/25 font-medium"
                        : "text-slate-400 hover:bg-slate-700/50 hover:text-white",
                    )}
                  >
                    <link.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white",
                      )}
                    />

                    {isSidebarOpen && (
                      <span className="ml-3 truncate">{link.text}</span>
                    )}

                    {!isSidebarOpen && (
                      <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                        {link.text}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div
            className={cn(
              "rounded-xl bg-slate-700/50 p-4 flex items-center gap-3",
              !isSidebarOpen && "justify-center p-2 bg-transparent",
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
              A
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-white truncate">
                  Administrator
                </span>
                <span className="text-xs text-slate-400 truncate">
                  admin@dgrv.com
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
