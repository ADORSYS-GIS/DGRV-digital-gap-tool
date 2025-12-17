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
    <Card className="group/card relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 h-full flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 transition-all duration-500 group-hover/card:h-1.5" />
      <CardContent className="p-6 flex-grow flex flex-col justify-between pt-8">
        <div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover/card:from-primary/20 group-hover/card:to-primary/10 group-hover/card:ring-primary/20 shadow-sm">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover/card:text-primary transition-colors duration-200">
                {organization.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                {organization.domain}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
