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
import { useDeleteDimension } from "@/hooks/dimensions/useDeleteDimension";
import { Dimension } from "@/types/dimension";
import { Layers, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SelectStateDialog } from "../levels/SelectStateDialog";
import { EditDimensionForm } from "./EditDimensionForm";

interface DimensionCardProps {
  dimension: Dimension;
}

export const DimensionCard = ({ dimension }: DimensionCardProps) => {
  const navigate = useNavigate();
  const [isSelectStateDialogOpen, setSelectStateDialogOpen] = useState(false);
  const { mutate: deleteDimension, isPending: isDeleting } =
    useDeleteDimension();

  const handleManageLevels = () => {
    setSelectStateDialogOpen(true);
  };

  const handleDelete = () => {
    deleteDimension(dimension.id);
  };

  const handleStateSelect = (state: "current" | "desired") => {
    setSelectStateDialogOpen(false);
    navigate(`/admin/dimensions/${dimension.id}/levels?levelType=${state}`);
  };

  return (
    <>
      <Card className="group transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
            <Layers className="h-6 w-6 text-blue-500" />
            {dimension.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {dimension.description}
          </p>
        </CardContent>
        <CardFooter className="flex-col items-stretch">
          <div className="flex gap-2 mb-2">
            <EditDimensionForm dimension={dimension} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the dimension.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <Button onClick={handleManageLevels} className="w-full">
            Manage Levels
          </Button>
        </CardFooter>
      </Card>
      <SelectStateDialog
        isOpen={isSelectStateDialogOpen}
        onClose={() => setSelectStateDialogOpen(false)}
        onSelect={handleStateSelect}
      />
    </>
  );
};
