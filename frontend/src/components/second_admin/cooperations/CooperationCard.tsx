import * as React from "react";
import { Cooperation } from "@/types/cooperation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePenLine, Trash2, ListTree } from "lucide-react";
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
// TODO: Create and import EditCooperationForm
// import { EditCooperationForm } from "./EditCooperationForm";
// TODO: Create and import useDeleteCooperation
// import { useDeleteCooperation } from "@/hooks/cooperations/useDeleteCooperation";
import { AssignDimensionToCooperationModal } from "./AssignDimensionToCooperationModal";
import { useDimensions } from "@/hooks/dimensions/useDimensions";

interface CooperationCardProps {
  cooperation: Cooperation;
}

export const CooperationCard: React.FC<CooperationCardProps> = ({
  cooperation,
}) => {
  const [isAssignDimensionOpen, setAssignDimensionOpen] = React.useState(false);
  const { data: dimensions } = useDimensions();
  // const deleteMutation = useDeleteCooperation();

  const handleDelete = () => {
    // deleteMutation.mutate(cooperation.id);
    console.log("Delete cooperation:", cooperation.id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{cooperation.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          <span className="font-semibold">Description:</span>{" "}
          {cooperation.description}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* <EditCooperationForm cooperation={cooperation} /> */}
          <Button variant="outline" size="sm">
            <FilePenLine className="mr-2 h-4 w-4" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  cooperation and remove its data from our servers.
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
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={() => setAssignDimensionOpen(true)}
        >
          <ListTree className="mr-2 h-4 w-4" /> Assign Dimensions
        </Button>
        {dimensions && (
          <AssignDimensionToCooperationModal
            isOpen={isAssignDimensionOpen}
            onClose={() => setAssignDimensionOpen(false)}
            dimensions={dimensions}
            cooperationName={cooperation.name}
          />
        )}
      </CardContent>
    </Card>
  );
};
