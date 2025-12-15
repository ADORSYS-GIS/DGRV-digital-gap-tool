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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Select an Organization</h1>
      {organizations && organizations.length > 0 ? (
        <OrganizationList
          organizations={organizations}
          onOrganizationSelect={handleOrganizationSelect}
        />
      ) : (
        <p>No organizations available.</p>
      )}
    </div>
  );
};

export default ViewReports;
