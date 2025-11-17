import React from "react";
import { Button } from "@/components/ui/button";
import { Cooperation } from "@/types/cooperation";

interface AssignDimensionDialogProps {
  cooperation: Cooperation;
}

export const AssignDimensionDialog: React.FC<AssignDimensionDialogProps> = ({
  cooperation,
}) => {
  return (
    <Button variant="outline" className="w-full">
      Assign Dimensions
    </Button>
  );
};
