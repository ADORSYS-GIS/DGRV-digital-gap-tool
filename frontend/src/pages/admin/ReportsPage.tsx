import React, { useState } from "react";
import { OrganizationReportList } from "@/components/admin/reports/OrganizationReportList";
import { AssessmentSubmissionList } from "@/components/admin/reports/AssessmentSubmissionList";
import { Organization } from "@/types/organization";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ReportsPage: React.FC = () => {
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const handleBackToOrganizations = () => {
    setSelectedOrganization(null);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          {selectedOrganization && (
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToOrganizations}
                className="text-gray-500 hover:text-primary hover:bg-primary/5 -ml-2"
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Organizations
              </Button>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Admin Reports
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {selectedOrganization
              ? `View submissions for ${selectedOrganization.name}`
              : "View and manage reports across all organizations."}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {selectedOrganization ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Submissions for {selectedOrganization.name}
              </h2>
            </div>
            <AssessmentSubmissionList
              organizationId={selectedOrganization.id}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Select an Organization
              </h2>
            </div>
            <OrganizationReportList
              onSelectOrganization={setSelectedOrganization}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
