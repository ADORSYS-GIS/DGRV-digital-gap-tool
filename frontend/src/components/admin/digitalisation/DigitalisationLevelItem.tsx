import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface DigitalisationLevel {
  id: string;
  level: number;
  description: string;
}

interface DigitalisationLevelItemProps {
  level: DigitalisationLevel;
  onEdit: (level: DigitalisationLevel) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const DigitalisationLevelItem: React.FC<
  DigitalisationLevelItemProps
> = ({ level, onEdit, onDelete, isDeleting }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{level.level}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{level.description}</p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => onEdit(level)}>
          Edit
        </Button>
        <Button
          variant="destructive"
          onClick={() => onDelete(level.id)}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </CardFooter>
    </Card>
  );
};
