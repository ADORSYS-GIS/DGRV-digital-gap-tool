import React from "react";
import { Outlet } from "react-router-dom";
import {
  Building2,
  Users,
  FilePlus2,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
  FileText,
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useTranslation } from "react-i18next";

const SecondAdminLayout: React.FC = () => {
  const organizationId = useOrganizationId();
  const { t } = useTranslation();

  const navLinks = [
    { to: "/second-admin/dashboard", icon: BarChart3, text: t("sidebar.secondAdmin.dashboard") },
    { to: "/second-admin/cooperations", icon: Building2, text: t("sidebar.secondAdmin.cooperatives") },
    { to: "/second-admin/manage-cooperation-users", icon: Users, text: t("sidebar.secondAdmin.manageUsers") },
    { to: "/second-admin/assessments", icon: FilePlus2, text: t("sidebar.secondAdmin.createAssessment") },
    { to: "/second-admin/action-plans", icon: ClipboardList, text: t("sidebar.secondAdmin.actionPlan") },
    { to: "/second-admin/submissions", icon: ClipboardCheck, text: t("sidebar.secondAdmin.submissions") },
    { to: `/second-admin/consolidated-report/${organizationId}`, icon: FileText, text: t("sidebar.secondAdmin.consolidatedReport") },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName={t("sidebar.secondAdmin.panelName")}
        panelAbbreviation="C"
        infoText={t("sidebar.secondAdmin.infoText")}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SecondAdminLayout;
export { SecondAdminLayout };
