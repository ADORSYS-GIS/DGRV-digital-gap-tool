import React from "react";
import { Outlet } from "react-router-dom";
import {
  FilePenLine,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { useTranslation } from "react-i18next";

const UserLayout: React.FC = () => {
  const { t } = useTranslation();

  const navLinks = [
    { to: "/user/dashboard", icon: BarChart3, text: t("sidebar.user.dashboard") },
    { to: "/user/assessments", icon: FilePenLine, text: t("sidebar.user.answerAssessment") },
    { to: "/user/action-plans", icon: ClipboardList, text: t("sidebar.user.actionPlan") },
    { to: "/user/submissions", icon: ClipboardCheck, text: t("sidebar.user.submissions") },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName={t("sidebar.user.panelName")}
        panelAbbreviation="U"
        infoText={t("sidebar.user.infoText")}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 h-full overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
