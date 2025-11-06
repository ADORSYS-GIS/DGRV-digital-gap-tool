import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dimension } from "@/types/dimension";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle } from "lucide-react";

interface AddAssessmentModalProps {
  dimensions: Dimension[];
  onSave: (name: string, selectedDimensions: string[]) => void;
}

export const AddAssessmentModal: React.FC<AddAssessmentModalProps> = ({ dimensions, onSave }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [selectedDimensions, setSelectedDimensions] = React.useState<string[]>([]);

  const handleDimensionToggle = (dimensionId: string) => {
    setSelectedDimensions((prevSelected) =>
      prevSelected.includes(dimensionId)
        ? prevSelected.filter((id) => id !== dimensionId)
        : [...prevSelected, dimensionId]
    );
  };

  const handleSave = () => {
    onSave(name, selectedDimensions);
    setIsOpen(false);
    setName("");
    setSelectedDimensions([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Assessment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Assessment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="assessment-name">Assessment Name</Label>
            <Input
              id="assessment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q4 Security Review"
            />
          </div>
          <div>
            <Label>Assign Dimensions</Label>
            <div className="space-y-2 mt-2">
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
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};