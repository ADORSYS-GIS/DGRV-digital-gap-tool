import { useState } from "react";
import { IDigitalisationLevel } from "@/types/digitalisationLevel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
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
import { useDeleteDigitalisationLevel } from "@/hooks/digitalisationLevels/useDeleteDigitalisationLevel";
import { EditLevelForm } from "./EditLevelForm";

interface LevelCardProps {
  level: IDigitalisationLevel;
  existingLevels: IDigitalisationLevel[];
}

export const LevelCard = ({ level, existingLevels }: LevelCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const deleteLevelMutation = useDeleteDigitalisationLevel();

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
          <CardTitle>State {level.state}</CardTitle>
          <Badge variant="secondary">{level.level}</Badge>
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
