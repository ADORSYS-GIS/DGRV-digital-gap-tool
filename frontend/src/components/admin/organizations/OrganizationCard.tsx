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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteOrganization } from "@/hooks/organizations/useDeleteOrganization";
import { Organization } from "@/types/organization";
import { Building2, FilePenLine, Trash2, Users } from "lucide-react";
import React, { useState } from "react";
import { EditOrganizationForm } from "./EditOrganizationForm";

interface OrganizationCardProps {
  organization: Organization;
  onAssignDimension?: (organization: Organization) => void;
  isSelectable?: boolean;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onAssignDimension,
  isSelectable,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const deleteMutation = useDeleteOrganization();

  const handleDelete = () => {
    deleteMutation.mutate(organization.id);
  };

  const handleAssignDimension = () => {
    if (onAssignDimension) {
      onAssignDimension(organization);
    }
  };

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
        {!isSelectable && (
          <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="w-full justify-center bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-sm hover:shadow transition-all duration-300 border-0"
                      onClick={handleAssignDimension}
                    >
                      <Users className="mr-2 h-4 w-4" /> Assign Dimension
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Assign dimensions to this organization</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 transition-colors"
                >
                  <FilePenLine className="mr-2 h-4 w-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Organization</DialogTitle>
                </DialogHeader>
                <EditOrganizationForm
                  organization={organization}
                  onSuccess={() => setIsEditDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 transition-colors"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the organization and remove its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
