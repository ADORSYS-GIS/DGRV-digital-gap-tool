import React, { useState } from "react";
import { OrganizationReportList } from "@/components/admin/reports/OrganizationReportList";
import { AssessmentSubmissionList } from "@/components/admin/reports/AssessmentSubmissionList";
import { Organization } from "@/types/organization";
import { Button } from "@/components/ui/button";

const ReportsPage: React.FC = () => {
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const handleBackToOrganizations = () => {
    setSelectedOrganization(null);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Reports</h1>

      {selectedOrganization ? (
        <div>
          <Button onClick={handleBackToOrganizations} className="mb-4">
            Back to Organizations
          </Button>
          <h2 className="text-2xl font-semibold mb-4">
            Submissions for {selectedOrganization.name}
          </h2>
          <AssessmentSubmissionList organizationId={selectedOrganization.id} />
        </div>
      ) : (
        <OrganizationReportList
          onSelectOrganization={setSelectedOrganization}
        />
      )}
    </div>
  );
};

export default ReportsPage;
