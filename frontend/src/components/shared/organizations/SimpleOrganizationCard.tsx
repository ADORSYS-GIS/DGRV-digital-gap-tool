import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Organization } from "@/types/organization";
import { Building2 } from "lucide-react";

interface SimpleOrganizationCardProps {
  organization: Organization;
}

export const SimpleOrganizationCard: React.FC<SimpleOrganizationCardProps> = ({
  organization,
}) => {
  return (
    <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardContent className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-md">
              <Building2 className="h-5 w-5 text-gray-500" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-900">
              {organization.name}
            </CardTitle>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            <span className="font-medium">Domain:</span> {organization.domain}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
