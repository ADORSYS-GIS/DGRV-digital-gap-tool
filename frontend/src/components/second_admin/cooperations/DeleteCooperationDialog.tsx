import React from "react";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeleteCooperationDialogProps {
  cooperationId: string;
  onDelete: (id: string) => void;
}

export const DeleteCooperationDialog: React.FC<
  DeleteCooperationDialogProps
> = ({ cooperationId, onDelete }) => {
  const { t } = useTranslation();

  const handleDelete = () => {
    onDelete(cooperationId);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          aria-label={t("secondAdmin.cooperations.delete.button", {
            defaultValue: "Delete",
          })}
        >
          <Trash2 className="mr-2 h-4 w-4" />{" "}
          {t("secondAdmin.cooperations.delete.button", {
            defaultValue: "Delete",
          })}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("secondAdmin.cooperations.delete.title", {
              defaultValue: "Are you sure?",
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("secondAdmin.cooperations.delete.description", {
              defaultValue:
                "This action cannot be undone. This will permanently delete the cooperation and remove its data from our servers.",
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
  );
};
