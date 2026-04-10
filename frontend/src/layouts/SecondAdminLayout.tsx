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

const SecondAdminLayout: React.FC = () => {
  const organizationId = useOrganizationId();

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
      text: "Create Assessment",
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
    {
      to: `/second-admin/consolidated-report/${organizationId}`,
      icon: FileText,
      text: "Consolidated Report",
    },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-muted/30">
      <Sidebar
        navLinks={navLinks}
        panelName="Organisation Admin"
        panelAbbreviation="C"
        infoText="This panel is for organization administrators to manage their cooperatives, users, and assessments."
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
