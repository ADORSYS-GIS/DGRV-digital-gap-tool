import React from "react";
import { useTranslation } from "react-i18next";
import { Organization } from "@/types/organization";
import { OrganizationCard } from "./OrganizationCard";

interface OrganizationListProps {
  organizations: Organization[];
  onAssignDimension?: (organization: Organization) => void;
  onOrganizationSelect?: (organizationId: string) => void;
}

export const OrganizationList: React.FC<OrganizationListProps> = ({
  organizations,
  onAssignDimension,
  onOrganizationSelect,
}) => {
  const { t } = useTranslation();

  const handleCardClick = (org: Organization) => {
    if (onOrganizationSelect) {
      onOrganizationSelect(org.id);
    }
  };

  return (
    <div>
      {organizations.length === 0 ? (
        <p>
          {t("admin.organizations.empty.noOrganizations", {
            defaultValue: "No organizations found.",
          })}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) =>
            onOrganizationSelect ? (
              <button
                key={org.id}
                onClick={() => handleCardClick(org)}
                title={org.name}
              >
                <OrganizationCard organization={org} isSelectable />
              </button>
            ) : (
              onAssignDimension && (
                <OrganizationCard
                  key={org.id}
                  organization={org}
                  onAssignDimension={onAssignDimension}
                />
              )
            ),
          )}
        </div>
      )}
    </div>
  );
};
