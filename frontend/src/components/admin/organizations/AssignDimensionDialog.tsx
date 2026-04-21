import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLogicalDimensions } from "@/hooks/dimensions/useLogicalDimensions";
import { useSetAssignedDimensions } from "@/hooks/organization_dimensions/useSetAssignedDimensions";
import { Organization } from "@/types/organization";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { getOrganizationDimensions } from "@/openapi-client/services.gen";

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
  const { t } = useTranslation();
  const { data: logicalDimensions, isLoading: isLoadingDimensions } =
    useLogicalDimensions();
  const { mutate: setAssignedDimensions, isPending } = useSetAssignedDimensions(
    organization?.id || "",
  );

  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);

  // Fetch assigned dimension_key values directly from API when dialog opens
  useEffect(() => {
    if (!isOpen || !organization?.id) return;
    setIsLoadingAssigned(true);
    getOrganizationDimensions({ orgId: organization.id })
      .then((res) => {
        // res is string[] of dimension_key UUIDs
        setSelectedDimensions((res as any) ?? []);
      })
      .catch(() => setSelectedDimensions([]))
      .finally(() => setIsLoadingAssigned(false));
  }, [isOpen, organization?.id]);

  const handleSave = () => {
    if (organization) {
      setAssignedDimensions(selectedDimensions, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const handleCheckboxChange = (dimensionKey: string, checked: boolean) => {
    setSelectedDimensions((prev) =>
      checked
        ? [...prev, dimensionKey]
        : prev.filter((k) => k !== dimensionKey),
    );
  };

  const isLoading = isLoadingDimensions || isLoadingAssigned;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("adminOrgs.assignDimensions")} to {organization?.name}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4 py-4">
            {logicalDimensions?.map((dimension) => (
              <div key={dimension.dimension_key} className="flex items-center space-x-2">
                <Checkbox
                  id={dimension.dimension_key}
                  checked={selectedDimensions.includes(dimension.dimension_key)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(dimension.dimension_key, !!checked)
                  }
                />
                <label
                  htmlFor={dimension.dimension_key}
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
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
