import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FilePlus2,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const UserLayout: React.FC = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navLinks = [
    {
      to: "/user/dashboard",
      icon: BarChart3,
      text: t("userLayout.nav.dashboard"),
    },
    {
      to: "/user/assessments",
      icon: FilePlus2,
      text: t("userLayout.nav.createAssessment"),
    },
    {
      to: "/user/action-plans",
      icon: ClipboardList,
      text: t("userLayout.nav.actionPlan"),
    },
    {
      to: "/user/submissions",
      icon: ClipboardCheck,
      text: t("userLayout.nav.submissions"),
    },
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
            <span className="text-xl font-bold">
              {t("userLayout.userPanel")}
            </span>
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
                    location.pathname.startsWith(link.to) && "bg-gray-900",
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

export default UserLayout;
