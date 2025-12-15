import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useOrganizationDimensions } from "@/hooks/organization_dimensions/useOrganizationDimensions";
import { useSetAssignedDimensions } from "@/hooks/organization_dimensions/useSetAssignedDimensions";
import { Organization } from "@/types/organization";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Checkbox } from "@/components/ui/checkbox";

interface AssignDimensionDialogProps {
  organization: Organization | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignDimensionDialog: React.FC<AssignDimensionDialogProps> = ({
  organization,
  isOpen,
  onClose,
}) => {
  const { data: allDimensions, isLoading: isLoadingDimensions } =
    useDimensions();
  const { data: assignedDimensionIds, isLoading: isLoadingAssigned } =
    useOrganizationDimensions(organization?.id || "");

  const { mutate: setAssignedDimensions, isPending } = useSetAssignedDimensions(
    organization?.id || "",
  );

  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (assignedDimensionIds) {
      setSelectedDimensions(assignedDimensionIds);
    }
  }, [assignedDimensionIds]);

  const handleSave = () => {
    if (organization) {
      setAssignedDimensions(selectedDimensions, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const handleCheckboxChange = (dimensionId: string, checked: boolean) => {
    setSelectedDimensions((prev) =>
      checked
        ? [...prev, dimensionId]
        : prev.filter((id) => id !== dimensionId),
    );
  };

  const isLoading = isLoadingDimensions || isLoadingAssigned;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("admin.organizations.assign.title", {
              name: organization?.name ?? "",
              defaultValue: "Assign Dimensions to {{name}}",
            })}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4 py-4">
            {allDimensions?.map((dimension) => (
              <div key={dimension.id} className="flex items-center space-x-2">
                <Checkbox
                  id={dimension.id}
                  checked={selectedDimensions.includes(dimension.id)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(dimension.id, !!checked)
                  }
                />
                <label
                  htmlFor={dimension.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {dimension.name}
                </label>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending
              ? t("common.saving", { defaultValue: "Saving..." })
              : t("common.save", { defaultValue: "Save" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
