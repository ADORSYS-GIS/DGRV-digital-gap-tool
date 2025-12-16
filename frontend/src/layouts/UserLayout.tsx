import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FilePlus2,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/user/dashboard", icon: BarChart3, text: "Dashboard" },
  { to: "/user/assessments", icon: FilePlus2, text: "Create Assessment" },
  { to: "/user/action-plans", icon: ClipboardList, text: "Action Plan" },
  { to: "/user/submissions", icon: ClipboardCheck, text: "Submissions" },
];

const UserLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-slate-900 text-white shadow-lg">
        <div className="flex h-16 items-center px-5 border-b border-white/10">
          <div className="h-8 w-8 rounded-lg bg-primary/30 flex items-center justify-center text-sm font-bold text-white">
            U
          </div>
          <span className="ml-3 text-sm font-semibold tracking-tight">
            User Panel
          </span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-200 hover:bg-slate-800 hover:text-white",
                )}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.text}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
