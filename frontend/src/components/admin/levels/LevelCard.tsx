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
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditLevelForm } from "./EditLevelForm";

interface LevelCardProps {
  level: IDigitalisationLevel;
  existingLevels: IDigitalisationLevel[];
}

export const LevelCard = ({ level, existingLevels }: LevelCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const deleteLevelMutation = useDeleteDigitalisationLevel();
  const queryClient = useQueryClient();
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
          <CardTitle>{`Level ${level.state}: ${level.level || ""}`}</CardTitle>
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
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                level.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Continue
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
