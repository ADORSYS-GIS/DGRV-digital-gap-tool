import React from "react";
import { Outlet } from "react-router-dom";
import { Building2, FileText, BarChart3, Settings, Users } from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { useTranslation } from "react-i18next";

const AdminLayout: React.FC = () => {
  const { t } = useTranslation();

  const navLinks = [
    { to: "/admin/dashboard", icon: BarChart3, text: t("sidebar.admin.dashboard") },
    { to: "/admin/organizations", icon: Building2, text: t("sidebar.admin.organizations") },
    { to: "/admin/dimensions", icon: Settings, text: t("sidebar.admin.dimensions") },
    { to: "/admin/recommendations", icon: FileText, text: t("sidebar.admin.recommendations") },
    { to: "/admin/action-plans", icon: Settings, text: t("sidebar.admin.actionPlan") },
    { to: "/admin/digital-gaps", icon: Settings, text: t("sidebar.admin.digitalGaps") },
    { to: "/admin/manage-users", icon: Users, text: t("sidebar.admin.manageUsers") },
    { to: "/admin/reports", icon: BarChart3, text: t("sidebar.admin.viewReports") },
    { to: "/admin/consolidated-report", icon: FileText, text: t("sidebar.admin.consolidatedReport") },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName={t("sidebar.admin.panelName")}
        panelAbbreviation="A"
        infoText={t("sidebar.admin.infoText")}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
export { AdminLayout };
