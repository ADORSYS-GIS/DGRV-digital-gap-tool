import React from 'react';
import { useOrganizations } from '@/hooks/organizations/useOrganizations';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Organization } from '@/types/organization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrganizationReportListProps {
  onSelectOrganization: (organization: Organization) => void;
}

export const OrganizationReportList: React.FC<OrganizationReportListProps> = ({
  onSelectOrganization,
}) => {
  const { data: organizations, isLoading, error } = useOrganizations();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500">Error loading organizations: {error.message}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {organizations?.map((organization) => (
        <Card
          key={organization.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelectOrganization(organization)}
        >
          <CardHeader>
            <CardTitle>{organization.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{organization.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};