import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserDimensions } from "@/openapi-client/services.gen";
import { db } from "@/services/db";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useOrganizationDimensions } from "@/hooks/organization_dimensions/useOrganizationDimensions";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { CooperationUser } from "@/types/cooperationUser";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { Pencil } from "lucide-react";

interface EditCooperationUserFormProps {
  user: CooperationUser;
}

export const EditCooperationUserForm = ({ user }: EditCooperationUserFormProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDimensionIds, setSelectedDimensionIds] = useState<string[]>(
    user.dimensionIds || [],
  );

  const organizationId = useOrganizationId();
  const cooperationId = useCooperationId();
  const queryClient = useQueryClient();

  const { data: allDimensions = [] } = useDimensions();
  const { data: assignedDimensionKeys = [] } = useOrganizationDimensions(organizationId || "");

  console.log("EditCooperationUserForm Debug:", {
    organizationId,
    allDimensionsCount: allDimensions.length,
    assignedDimensionKeysCount: assignedDimensionKeys.length,
    assignedDimensionKeys
  });

  const filteredDimensions = allDimensions.filter((d) => {
    const isMatched = d.dimension_key && assignedDimensionKeys.includes(d.dimension_key);
    if (allDimensions.length > 0 && assignedDimensionKeys.length > 0 && !isMatched) {
      console.log("EditCooperationUserForm Mismatch:", { dimensionKey: d.dimension_key, dimensionName: d.name });
    }
    return isMatched;
  });

  console.log("EditCooperationUserForm Filtered:", {
    filteredCount: filteredDimensions.length,
    dimensionKeys: allDimensions.map(d => d.dimension_key)
  });

  const userId = user.id;

  const { mutate: saveUser, isPending } = useMutation({
    mutationFn: () =>
      updateUserDimensions({
        userId,
        requestBody: {
          dimension_ids: selectedDimensionIds,
          email: user.email ?? null,
        },
      }),
    onSuccess: async () => {
      // Update the user in IndexedDB with the new dimension IDs
      await db.cooperationUsers.update(user.id, {
        dimensionIds: selectedDimensionIds,
      });
      toast.success(t("secondAdminCooperationUsers.edit.toast.success"));
      queryClient.invalidateQueries({ queryKey: ["cooperationUsers", cooperationId] });
      setIsOpen(false);
    },
    onError: () => {
      toast.error(t("secondAdminCooperationUsers.edit.toast.error"));
    },
  });

  const handleOpen = () => {
    setSelectedDimensionIds(user.dimensionIds || []);
    setIsOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
      >
        <Pencil className="mr-2 h-4 w-4" />
        {t("secondAdminCooperationUsers.edit.triggerLabel")}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t("secondAdminCooperationUsers.edit.title")}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t("secondAdminCooperationUsers.edit.description")}
            </p>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label>{t("secondAdminCooperationUsers.add.form.dimensionsLabel")}</Label>
            <div className="mt-2 grid gap-2 max-h-56 overflow-y-auto rounded-md border bg-muted/40 p-3">
              {filteredDimensions.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("secondAdminCooperationUsers.add.form.noDimensions")}
                </p>
              )}
              {filteredDimensions.map((dimension) => (
                <label key={dimension.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={dimension.dimension_key ? selectedDimensionIds.includes(dimension.dimension_key) : false}
                    onCheckedChange={(checked) => {
                      if (!dimension.dimension_key) return;
                      const key = dimension.dimension_key;
                      setSelectedDimensionIds((prev) =>
                        checked
                          ? [...prev, key]
                          : prev.filter((id) => id !== key),
                      );
                    }}
                  />
                  <span>{dimension.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t("secondAdminCooperationUsers.add.form.cancel")}
            </Button>
            <Button onClick={() => saveUser()} disabled={isPending || !userId}>
              {isPending
                ? t("secondAdminCooperationUsers.edit.saving")
                : t("secondAdminCooperationUsers.form.submit", { defaultValue: "Save changes" })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
