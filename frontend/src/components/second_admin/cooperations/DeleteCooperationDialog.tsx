import React from "react";
import { useTranslation } from "react-i18next";
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
          className="w-full shadow-sm hover:shadow-md transition-all"
        >
          <Trash2 className="mr-2 h-4 w-4" /> {t("secondAdminCooperations.delete.triggerLabel")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("secondAdminCooperations.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("secondAdminCooperations.delete.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("secondAdminCooperations.delete.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>{t("secondAdminCooperations.delete.confirm")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
