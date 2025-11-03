import React from "react";
import { AddOrganizationForm } from "@/components/admin/organizations/AddOrganizationForm";
import { OrganizationList } from "@/components/admin/organizations/OrganizationList";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const ManageOrganizationsPage: React.FC = () => {
  const { data: organizations, isLoading, error } = useOrganizations();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Organizations</h1>
          <p className="text-muted-foreground">
            Add and manage cooperative organizations
          </p>
        </div>
        <AddOrganizationForm />
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <p>Error loading organizations: {error.message}</p>}
      {!isLoading && !error && (
        <OrganizationList organizations={organizations || []} />
      )}
    </div>
  );
};

export default ManageOrganizationsPage;
