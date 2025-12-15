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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const handleDelete = () => {
    deleteMutation.mutate(organization.id);
  };

  const handleAssignDimension = () => {
    if (onAssignDimension) {
      onAssignDimension(organization);
    }
  };

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
            <span className="font-medium">
              {t("admin.organizations.card.domainLabel", {
                defaultValue: "Domain:",
              })}
            </span>{" "}
            {organization.domain}
          </p>
        </div>
        {!isSelectable && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex w-full gap-2 mb-2">
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <FilePenLine className="mr-2 h-4 w-4" />{" "}
                    {t("common.edit", { defaultValue: "Edit" })}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t("admin.organizations.edit.title", {
                        defaultValue: "Edit Organization",
                      })}
                    </DialogTitle>
                  </DialogHeader>
                  <EditOrganizationForm
                    organization={organization}
                    onSuccess={() => setIsEditDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                    {deleteMutation.isPending
                      ? t("common.deleting", { defaultValue: "Deleting..." })
                      : t("common.delete", { defaultValue: "Delete" })}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("common.confirmTitle", { defaultValue: "Confirm" })}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("admin.organizations.deleteConfirm", {
                        defaultValue:
                          "This action cannot be undone. This will permanently delete the organization and remove its data from our servers.",
                      })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t("common.cancel", { defaultValue: "Cancel" })}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      {t("common.continue", { defaultValue: "Continue" })}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleAssignDimension}
                  >
                    <Users className="mr-2 h-4 w-4" />{" "}
                    {t("admin.organizations.assign.button", {
                      defaultValue: "Assign Dimension",
                    })}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t("admin.organizations.assign.tooltip", {
                      defaultValue: "Assign dimensions to this organization",
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
