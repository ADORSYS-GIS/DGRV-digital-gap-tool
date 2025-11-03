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
import { useDeleteDigitalisationLevel } from "@/hooks/digitalisationLevels/useDeleteDigitalisationLevel";
import { DigitalisationLevel } from "@/types/digitalisationLevel";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { EditLevelForm } from "./EditLevelForm";

interface LevelsListProps {
  levels: DigitalisationLevel[];
}

export const LevelsList = ({ levels }: LevelsListProps) => {
  const { mutate: deleteLevel, isPending: isDeleting } =
    useDeleteDigitalisationLevel();

  if (levels.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        <p className="text-lg">No levels created yet.</p>
        <p>Click "Add Level" to get started.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableHead className="w-[100px] font-semibold text-gray-700 dark:text-gray-300">
              State
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
              Scope
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {levels
            .slice()
            .sort((a, b) => a.state - b.state)
            .map((level, index) => (
              <TableRow
                key={level.id}
                className={
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                }
              >
                <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                  State {level.state}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">
                  {level.scope}
                </TableCell>
                <TableCell className="text-right">
                  <EditLevelForm level={level} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the level.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteLevel(level.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
