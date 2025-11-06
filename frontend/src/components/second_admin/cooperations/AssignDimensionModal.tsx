import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dimension } from "@/types/dimension";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AssignDimensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dimensions: Dimension[];
  cooperationName: string;
}

export const AssignDimensionModal: React.FC<AssignDimensionModalProps> = ({
  isOpen,
  onClose,
  dimensions,
  cooperationName,
}) => {
  const [selectedDimensions, setSelectedDimensions] = React.useState<string[]>([]);

  const handleDimensionToggle = (dimensionId: string) => {
    setSelectedDimensions((prevSelected) =>
      prevSelected.includes(dimensionId)
        ? prevSelected.filter((id) => id !== dimensionId)
        : [...prevSelected, dimensionId]
    );
  };

  const handleSave = () => {
    // TODO: Implement the logic to save the assigned dimensions
    console.log("Selected dimensions:", selectedDimensions);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Dimensions to {cooperationName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {dimensions.map((dimension) => (
            <div key={dimension.id} className="flex items-center space-x-2">
              <Checkbox
                id={`dimension-${dimension.id}`}
                checked={selectedDimensions.includes(dimension.id)}
                onCheckedChange={() => handleDimensionToggle(dimension.id)}
              />
              <Label htmlFor={`dimension-${dimension.id}`}>{dimension.name}</Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};