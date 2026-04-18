import React from "react";
import { Outlet } from "react-router-dom";
import {
  Users,
  FilePenLine,
  ClipboardList,
  Inbox,
  BarChart3,
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { useTranslation } from "react-i18next";

const ThirdAdminLayout: React.FC = () => {
  const { t } = useTranslation();

  const navLinks = [
    { to: "/third-admin/dashboard", icon: BarChart3, text: t("sidebar.thirdAdmin.dashboard") },
    { to: "/third-admin/manage-cooperation-users", icon: Users, text: t("sidebar.thirdAdmin.manageUsers") },
    { to: "/third-admin/assessments", icon: FilePenLine, text: t("sidebar.thirdAdmin.answerAssessment") },
    { to: "/third-admin/action-plans", icon: ClipboardList, text: t("sidebar.thirdAdmin.actionPlan") },
    { to: "/third-admin/submissions", icon: Inbox, text: t("sidebar.thirdAdmin.viewSubmissions") },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName={t("sidebar.thirdAdmin.panelName")}
        panelAbbreviation="T"
        infoText={t("sidebar.thirdAdmin.infoText")}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 h-full overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ThirdAdminLayout;
