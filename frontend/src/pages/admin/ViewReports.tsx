import { OrganizationList } from "@/components/admin/organizations/OrganizationList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import React from "react";
import { useNavigate } from "react-router-dom";

const ViewReports: React.FC = () => {
  const { data: organizations, isLoading, error } = useOrganizations();
  const navigate = useNavigate();

  const handleOrganizationSelect = (organizationId: string) => {
    navigate(`/admin/reports/${organizationId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error loading organizations: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            View Reports
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Select an organization to view and export their assessment reports.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Select an Organization
          </h2>
        </div>
        {organizations && organizations.length > 0 ? (
          <OrganizationList
            organizations={organizations}
            onOrganizationSelect={handleOrganizationSelect}
          />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No organizations available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReports;
