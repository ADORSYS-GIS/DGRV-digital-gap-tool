import React, { useState } from "react";
import { AddOrganizationForm } from "@/components/admin/organizations/AddOrganizationForm";
import { OrganizationList } from "@/components/admin/organizations/OrganizationList";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AssignDimensionDialog } from "@/components/admin/organizations/AssignDimensionDialog";
import { Organization } from "@/types/organization";
import { EmptyState } from "@/components/shared/EmptyState";
import { Building2 } from "lucide-react";

const ManageOrganizationsPage: React.FC = () => {
  const { data: organizations, isLoading, error } = useOrganizations();
  const [isAssignDimensionDialogOpen, setIsAssignDimensionDialogOpen] =
    useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const handleOpenAssignDimensionDialog = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsAssignDimensionDialogOpen(true);
  };

  const handleCloseAssignDimensionDialog = () => {
    setSelectedOrganization(null);
    setIsAssignDimensionDialogOpen(false);
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Manage Organizations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Add and manage cooperative organizations in the system.
          </p>
        </div>
        <div className="flex-shrink-0">
          <AddOrganizationForm />
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
          Error loading organizations: {error.message}
        </div>
      )}
      {!isLoading && !error && (
        <>
          {organizations && organizations.length > 0 ? (
            <OrganizationList
              organizations={organizations}
              onAssignDimension={handleOpenAssignDimensionDialog}
            />
          ) : (
            <EmptyState
              icon={Building2}
              title="No organizations found"
              description="Get started by adding your first cooperative organization to the system."
            />
          )}
        </>
      )}

      <AssignDimensionDialog
        organization={selectedOrganization}
        isOpen={isAssignDimensionDialogOpen}
        onClose={handleCloseAssignDimensionDialog}
      />
    </div>
  );
};

export default ManageOrganizationsPage;
