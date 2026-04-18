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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeleteDigitalisationLevel } from "@/hooks/digitalisationLevels/useDeleteDigitalisationLevel";
import { IDigitalisationLevel } from "@/types/digitalisationLevel";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EditLevelForm } from "./EditLevelForm";

interface LevelCardProps {
  level: IDigitalisationLevel;
  existingLevels: IDigitalisationLevel[];
}

export const LevelCard = ({ level, existingLevels }: LevelCardProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const deleteLevelMutation = useDeleteDigitalisationLevel();
  const handleDelete = () => {
    deleteLevelMutation.mutate({
      dimensionId: level.dimensionId,
      levelId: level.id,
    });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{level.title || t("common.noTitle")}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 pt-2">
              {level.description || t("common.noDescription")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="mt-auto flex justify-end space-x-2 p-4">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Edit className="mr-2 h-4 w-4" />
          {t("common.edit")}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteLevelMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteLevelMutation.isPending
                ? t("adminLevels.delete.deleting")
                : t("adminLevels.card.delete")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("adminLevels.delete.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("adminLevels.delete.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                {t("adminLevels.delete.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
      <EditLevelForm
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        level={level}
        existingLevels={existingLevels}
      />
    </Card>
  );
};
