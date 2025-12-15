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
import { EditLevelForm } from "./EditLevelForm";
import { useTranslation } from "react-i18next";

interface LevelCardProps {
  level: IDigitalisationLevel;
  existingLevels: IDigitalisationLevel[];
}

export const LevelCard = ({ level, existingLevels }: LevelCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const deleteLevelMutation = useDeleteDigitalisationLevel();
  const { t } = useTranslation();

  const handleDelete = () => {
    setIsDeleting(true);
    deleteLevelMutation.mutate(
      {
        dimensionId: level.dimensionId,
        levelId: level.id,
        levelType: level.levelType,
      },
      {
        onSettled: () => {
          setIsDeleting(false);
        },
      },
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>
            {level.level ||
              `${t("admin.levels.stateLabel", { defaultValue: "State" })} ${level.state}`}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {level.description}
        </p>
      </CardContent>
      <CardFooter className="mt-auto flex justify-end space-x-2 p-4">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Edit className="mr-2 h-4 w-4" />
          {t("common.edit", { defaultValue: "Edit" })}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting
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
                {t("admin.levels.deleteConfirm", {
                  defaultValue:
                    "This action cannot be undone. This will permanently delete the level.",
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
