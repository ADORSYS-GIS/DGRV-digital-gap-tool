import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Cooperation } from "@/types/cooperation";

interface AssignDimensionDialogProps {
  cooperation: Cooperation;
}

export const AssignDimensionDialog: React.FC<AssignDimensionDialogProps> = ({
  cooperation,
}) => {
  const { t } = useTranslation();
  return (
    <Button variant="outline" className="w-full">
      {t("secondAdminCooperations.assign.trigger")}
    </Button>
  );
};
