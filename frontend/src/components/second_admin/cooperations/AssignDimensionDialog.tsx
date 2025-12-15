import React from "react";
import { Button } from "@/components/ui/button";
import { Cooperation } from "@/types/cooperation";
import { useTranslation } from "react-i18next";

interface AssignDimensionDialogProps {
  cooperation: Cooperation;
}

export const AssignDimensionDialog: React.FC<AssignDimensionDialogProps> = ({
  cooperation,
}) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      className="w-full"
      aria-label={t("secondAdmin.cooperations.assignDimensions", {
        defaultValue: "Assign Dimensions",
      })}
    >
      {t("secondAdmin.cooperations.assignDimensions", {
        defaultValue: "Assign Dimensions",
      })}
    </Button>
  );
};
