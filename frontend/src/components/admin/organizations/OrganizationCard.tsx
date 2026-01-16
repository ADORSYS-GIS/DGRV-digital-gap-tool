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
