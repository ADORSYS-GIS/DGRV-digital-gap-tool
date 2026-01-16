import React, { useState } from "react";
import { AddOrganizationForm } from "@/components/admin/organizations/AddOrganizationForm";
import { OrganizationList } from "@/components/admin/organizations/OrganizationList";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AssignDimensionDialog } from "@/components/admin/organizations/AssignDimensionDialog";
import { Organization } from "@/types/organization";
import { useTranslation } from "react-i18next";

const ManageOrganizationsPage: React.FC = () => {
  const { t } = useTranslation();
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Organizations</h1>
          <p className="text-muted-foreground">
            Add and manage cooperative organizations
          </p>
        </div>
        <div className="flex-shrink-0">
          <AddOrganizationForm />
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <p>Error loading organizations: {error.message}</p>}
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
