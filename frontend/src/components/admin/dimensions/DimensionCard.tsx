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
import { IDimension } from "@/types/dimension";
import { Layers, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SelectStateDialog } from "../levels/SelectStateDialog";
import { EditDimensionForm } from "./EditDimensionForm";

interface DimensionCardProps {
  dimension: IDimension;
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
    navigate(`/admin/manage-levels/${dimension.id}?levelType=${state}`);
  };

  return (
    <>
      <Card className="group/card relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 h-full flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 transition-all duration-500 group-hover/card:h-1.5" />
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover/card:from-primary/20 group-hover/card:to-primary/10 group-hover/card:ring-primary/20 shadow-sm">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover/card:text-primary transition-colors duration-200">
                {dimension.name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {dimension.description}
          </p>
        </CardContent>
        <CardFooter className="flex-col items-stretch pt-0 pb-6 px-6 gap-3">
          <Button
            onClick={handleManageLevels}
            className="w-full justify-center bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-sm hover:shadow transition-all duration-300 border-0"
          >
            Manage Levels
          </Button>
          <div className="grid grid-cols-2 gap-3 w-full">
            <EditDimensionForm dimension={dimension} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-center border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 transition-colors"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the dimension and remove its associated data from our
                    servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Deleting..." : "Continue"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
