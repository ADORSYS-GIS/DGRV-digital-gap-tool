import React from "react";
import { Organization } from "@/types/organization";
import { OrganizationCard } from "./OrganizationCard";

interface OrganizationListProps {
  organizations: Organization[];
}

export const OrganizationList: React.FC<OrganizationListProps> = ({
  organizations,
}) => {
  return (
    <div>
      {organizations.length === 0 ? (
        <p>No organizations found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))}
        </div>
      )}
    </div>
  );
};
