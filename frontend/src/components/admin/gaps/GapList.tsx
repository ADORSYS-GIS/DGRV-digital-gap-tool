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
import { Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../ui/table";

import { Gap } from "@/types/gap";

interface GapListProps {
  gaps: Gap[];
}

export const GapList = ({ gaps }: GapListProps) => {
  // TODO: Implement useDeleteGap hook
  const isDeleting = false; // Placeholder

  if (gaps.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        <p className="text-lg">No gaps created yet.</p>
        <p>Click "Add Gap" to get started.</p>
      </div>
    );
  }

  return (
    <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <TableHeader className="bg-gray-50 dark:bg-gray-800">
        <TableRow>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Category
          </TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Gap Level
          </TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Scope
          </TableHead>
          <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Score
          </TableHead>
          <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
        {gaps.map((gap) => (
          <TableRow key={gap.id}>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
              {gap.category}
            </TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {gap.gap}
            </TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {gap.scope}
            </TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
              {gap.gapScore}
            </TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              {/* TODO: Implement EditGapForm */}
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the gap.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => console.log("Delete gap", gap.id)} // TODO: Call deleteGap
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
  );
};