import React from "react";
import { Cooperation } from "@/types/cooperation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditCooperationForm } from "./EditCooperationForm";
import { DeleteCooperationDialog } from "./DeleteCooperationDialog";
// import { AssignDimensionDialog } from "./AssignDimensionDialog";
import { ListTree } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CooperationCardProps {
  cooperation: Cooperation;
  onUpdate: (cooperation: Cooperation) => void;
  onDelete: (id: string) => void;
}

export const CooperationCard: React.FC<CooperationCardProps> = ({
  cooperation,
  onUpdate,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{cooperation.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          {cooperation.description}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <EditCooperationForm cooperation={cooperation} onUpdate={onUpdate} />
          <DeleteCooperationDialog
            cooperationId={cooperation.id}
            onDelete={onDelete}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          aria-label={t("secondAdmin.cooperations.assignDimensions", {
            defaultValue: "Assign Dimensions",
          })}
        >
          <ListTree className="mr-2 h-4 w-4" />{" "}
          {t("secondAdmin.cooperations.assignDimensions", {
            defaultValue: "Assign Dimensions",
          })}
        </Button>
      </CardContent>
    </Card>
  );
};
