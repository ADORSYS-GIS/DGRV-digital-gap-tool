import React from "react";
import { EditOrganizationForm } from "./EditOrganizationForm";
import { Organization } from "@/types/organization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePenLine, Trash2, ListTree } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteOrganization } from "@/hooks/organizations/useDeleteOrganization";

interface OrganizationCardProps {
  organization: Organization;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
}) => {
  const deleteMutation = useDeleteOrganization();

  const handleDelete = () => {
    deleteMutation.mutate(organization.id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{organization.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          <span className="font-semibold">Domains:</span> {organization.domain}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <EditOrganizationForm organization={organization} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  organization and remove its data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Button variant="outline" size="sm" className="mt-2 w-full">
          <ListTree className="mr-2 h-4 w-4" /> Assign Categories
        </Button>
      </CardContent>
    </Card>
  );
};
